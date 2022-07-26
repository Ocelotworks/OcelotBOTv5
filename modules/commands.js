const Sentry = require('@sentry/node');
const {CustomCommandContext, InteractionCommandContext, MessageCommandContext, MessageEditCommandContext} = require("../util/CommandContext");
const fs = require('fs');
const Util = require("../util/Util");
const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const {crc32} = require("crc");
const {axios} = require("../util/Http");
const config = require('config');
const commandParser = require('command-parser').default;
module.exports = class Commands {

    // The OcelotBOT instance
    bot;
    // The Command Middlewares, mapped by their name
    commandMiddleware = {};
    // The Command Middleware names in the order they are executed
    middlewareOrder = [];

    name = "Commands";
    
    constructor(bot){
        this.bot = bot;
        bot.command = this;
    }

    init() {
        this.bot.commandObjects = {};
        this.bot.commandUsages = {};
        this.bot.slashCategories = [];
        this.bot.commands = {};
        this.bot.prefixCache = {};


        process.on('exit', async (code) => {
            this.bot.logger.log("Process close requested", code);
            this.bot.drain = true;
            for (let command in this.bot.commandObjects) {
                if (this.bot.commandObjects.hasOwnProperty(command) && this.bot.commandObjects[command].shutdown) {
                    this.bot.logger.log("Shutting down ", command);
                    await this.bot.commandObjects[command].shutdown(this.bot);
                }
            }
        })

        this.bot.client.on("ready", this.onDiscordReady.bind(this));
        this.bot.client.on("messageCreate", this.onMessageCreate.bind(this));
        this.bot.client.on("messageUpdate", this.onMessageUpdate.bind(this));
        this.bot.client.on("interactionCreate", this.onSlashCommandInteraction.bind(this));
        this.bot.client.on("interactionCreate", this.onContextInteraction.bind(this));
        this.bot.client.on("interactionCreate", this.onAutocompleteInteraction.bind(this));

        this.bot.api.post("/command", this.onHttpCommand.bind(this));

        this.bot.runCommand = this.runCommand.bind(this);
        this.bot.addCommandMiddleware = this.addCommandMiddleware.bind(this);

        this.addCommandMiddleware(require('../util/middleware/CheckSendPermissions'), "Check Send Permissions", 100);
        this.addCommandMiddleware(require('../util/middleware/NSFWChannels'), "Check NSFW Channels", 99);
        this.addCommandMiddleware(require('../util/middleware/CommandOverride'), "Command Override", 97);
        this.addCommandMiddleware(require('../util/middleware/CheckPermissions'), "Check Permissions", 98);
        this.addCommandMiddleware(require('../util/middleware/Notices'), "Send Notices", 96);
        this.addCommandMiddleware(require('../util/middleware/MessageCommandDeprecation'), "Send Message Command Deprecation warning", 95);

        this.bot.bus.once("modulesLoaded", ()=>{
            this.bot.interactions.addHandler("S", this.onSentryFeedback.bind(this));
        })

        this.loadCommands();
    }

    /**
     * Load all the custom functions when Discord has logged in successfully and we have a guild list
     * @returns {Promise<void>}
     */
    async onDiscordReady(){
        let commands = await this.bot.database.getCustomFunctionsForShard("COMMAND", [...this.bot.client.guilds.cache.keys()]);
        for(let i = 0; i < commands.length; i++){
            const command = commands[i];
            if(this.bot.customFunctions.COMMAND[command.server])
                this.bot.customFunctions.COMMAND[command.server][command.trigger] = command.function;
            else
                this.bot.customFunctions.COMMAND[command.server] = {[command.trigger]: command.function};
        }
    }

    /**
     * Try and parse messages as commands
     * @param message
     * @returns {Promise<*|void>|void}
     */
    onMessageCreate(message){
        if (this.bot.drain || (message.author.bot && message.author.id !== "824045686600368189")) return; // 824045686600368189 = Watson, a bot that is allowed to use OcelotBOT
        const parse = this.parseCommand(message);
        if(!parse)return;
        const context = this.initContext(new MessageCommandContext(this.bot, message, parse.args, parse.command));
        if(!context)return;
        if(context.getBool("disableMessageCommands"))return console.log("Message commands disabled");
        return this.runCommand(context);
    }

    /**
     * Edited messages are checked again and reparsed as commands
     * @param oldMessage
     * @param newMessage
     * @returns {Promise<*|void>|void}
     */
    onMessageUpdate(oldMessage, newMessage){
        if (this.bot.drain ||  !newMessage.author || newMessage.author?.bot) return;
        if(oldMessage.content == newMessage.content)return;
        if(oldMessage.response?.deleted)return this.bot.logger.log("Edited message response was deleted");
        const parse = this.parseCommand(newMessage);
        if(!parse)return;
        const context = this.initContext(new MessageEditCommandContext(this.bot, newMessage, oldMessage.response, parse.args, parse.command));
        if(!context)return;
        if(context.getBool("disableMessageCommands"))return console.log("Message commands disabled");
        return this.runCommand(context);
    }

    /**
     * Slash command interactions are parsed here
     * @param interaction
     * @returns {Promise<*|void>|void}
     */
    onSlashCommandInteraction(interaction){
        console.log(interaction);
        if(this.bot.drain)return;
        if(!interaction.isCommand())return; // Not a command
        console.log("Interaction command", interaction.commandName)
        if(!(this.bot.slashCategories.includes(interaction.commandName) && interaction.options?.getSubcommand(false)) && !this.bot.commandUsages[interaction.commandName])return console.log("Unknown command interaction", interaction.commandName); // No such command
        const context = new InteractionCommandContext(this.bot, interaction);
        context.commandData = this.bot.commandUsages[context.command];
        return this.runCommand(context);
    }

    /**
     * Context Menu Interactions are here
     * Context menus are treated as if the user performed a command with
     * parameters that are specified by the command metadata, depending on the
     * type of context menu this is
     * @param interaction
     * @returns {Promise<*|void>}
     */
    async onContextInteraction(interaction){
        if(this.bot.drain)return;
        if(!interaction.isContextMenu())return; // Not a context menu
        const commandName = interaction.commandName.split("/")[1];
        const commandData = this.bot.commandUsages[commandName];
        if(!commandData)return console.log("Unknown command interaction", commandName); // No such command
        if(!commandData.contextMenu)return console.log("Context menu interaction for non-context menu command");
        const context = new InteractionCommandContext(this.bot, interaction);
        context.command = commandName;
        context.commandData = this.bot.commandUsages[context.command];
        try {
            switch (commandData.contextMenu.type) {
                case "text":
                    context.options[commandData.contextMenu.value] = (await context.channel.messages.fetch(interaction.targetId)).content;
                    break;
                case "message":
                case "user":
                    context.options[commandData.contextMenu.value] = interaction.targetId;
                    break;
            }
        }catch(e){
            console.error(e);
        }

        if(commandData.contextMenu.func)
            return commandData.runContextMenu(context, this.bot);

        return this.runCommand(context);
    }

    async onAutocompleteInteraction(interaction){
        if(this.bot.drain)return;
        if(!interaction.isAutocomplete())return;
        const commandData = this.bot.commandUsages[interaction.commandName];
        if(!commandData){ // No such command
            interaction.respond([]);
            return console.log("Unknown command interaction", interaction.commandName);
        }
        const subCommand = interaction.options.getSubcommand(false);
        this.bot.logger.log(`Autocomplete: ${interaction.options.getFocused()} on /${interaction.commandName} ${subCommand}`);
        if(subCommand && commandData.subCommands[subCommand]?.autocomplete)
            return interaction.respond(await commandData.subCommands[subCommand].autocomplete(interaction.options.getFocused(), interaction, this.bot))
        if(commandData.autocomplete)
            return interaction.respond(await commandData.autocomplete(interaction.options.getFocused(), interaction, this.bot))
        this.bot.logger.warn(`Autocomplete triggered for function with no autocomplete capability ${interaction.commandName} ${subCommand}`);
        return interaction.respond([]);
    }

    onHttpCommand(req, res){

    }

    /**
     * Parses the basic data about the command and validates it's existence
     * @param message
     * @returns {{args: *, command: string}|null}
     */
    parseCommand(message){
        const prefix = message.getSetting("prefix");
        if (!prefix) return null;//Bot hasn't fully loaded
        const prefixLength = prefix.length;
        if (!message.content.startsWith(prefix))return null;
        const args = message.content.split(/\s+/g);
        const command = args[0].substring(prefixLength).toLowerCase();
        if(!this.bot.commandUsages[command] && !this.bot.customFunctions.COMMAND[message.guild?.id] )return null;
        return {args, command};
    }

    /**
     * Populates the parsed command argument data into a MessageCommandContext
     * @param {CommandContext} context
     * @returns {CommandContext}
     */
    initContext(context){
        context.commandData = this.bot.commandUsages[context.command];
        if(context.commandData?.pattern) {
            const parsedInput = commandParser.Parse(context.args.slice(1).join(" "), {pattern: context.commandData.pattern, id: context.command});
            if (parsedInput.error) {
                context.error = parsedInput.error;
            } else {
                context.options = parsedInput.data;
            }
        }
        return context;
    }

    /**
     * Load all the commands from the command dir
     */
    loadCommands () {
        fs.readdir(`${__dirname}/../commands`, (err, files)=>{
            if (err) {
                this.bot.logger.error("Error reading from commands directory");
                console.error(err);
                Sentry.captureException(err);
            } else {
                let promises = [];
                for (const command of files) {
                    if (!fs.lstatSync(`${__dirname}/../commands/${command}`).isDirectory()) {
                        promises.push(this.loadCommand(command));
                    }
                }
                Promise.all(promises).then(()=>{
                    this.bot.bus.emit("commandLoadFinished");
                    this.bot.logger.log("Finished loading commands.");
                })
            }
        });
    }

    /**
     * Load an individual command object
     * @param {string} command The command file, relative to commands/
     * @param {boolean} reload Is this a reload or a fresh load
     * @returns {Promise<void>}
     */
    async loadCommand(command, reload) {
        try {
            const module = `${__dirname}/../commands/${command}`;
            if (reload) {
                delete require.cache[require.resolve(module)];
            }
            let crc = crc32(fs.readFileSync(module, 'utf8')).toString(16);
            let loadedCommand = require(module);
            // Class-type
            if(loadedCommand instanceof Function){
                loadedCommand = new loadedCommand(this.bot);
            }
            if (loadedCommand.init && !reload) {
                try {
                    loadedCommand.init(this.bot);
                } catch (e) {
                    Sentry.captureException(e);
                    this.bot.logger.error(e);
                    if (this.bot.client && this.bot.client.shard) {
                        this.bot.rabbit.event({
                            type: "warning", payload: {
                                id: "badInit-" + command,
                                message: `Couldn't initialise command ${command}:\n${e.message}`
                            }
                        });
                    }
                }
            } else if (loadedCommand.init) {
                this.bot.logger.warn(`Command ${command} was reloaded, but init was not run.`);
            }
            this.bot.logger.log(`Loaded command ${loadedCommand.name} ${`(${crc})`.gray}`);

            if (reload) {
                if (this.bot.commandUsages[loadedCommand.commands[0]]) {
                    let oldCrc = this.bot.commandUsages[loadedCommand.commands[0]].crc;
                    if (oldCrc !== crc)
                        this.bot.logger.log(`Command ${command} version has changed from ${oldCrc} to ${crc}.`);
                    else
                        this.bot.logger.warn(`Command ${command} was reloaded but remains the same version.`);
                }
            }

            if(loadedCommand.slashCategory && !this.bot.slashCategories.includes(loadedCommand.slashCategory)){
                this.bot.slashCategories.push(loadedCommand.slashCategory);
            }

            if(loadedCommand.nestedDir){
                loadedCommand = await this.loadSubcommand(loadedCommand);
            }

            loadedCommand.pattern = commandParser.BuildPattern(command, loadedCommand.usage).pattern;
            if(!loadedCommand.slashHidden && !loadedCommand.slashOptions) {
                // Load sub commands
                if (loadedCommand.subCommands) {
                    loadedCommand.slashOptions = [];
                    let used = [];
                    for(let subCommandId in loadedCommand.subCommands){
                        if(!loadedCommand.subCommands.hasOwnProperty(subCommandId) || !loadedCommand.subCommands[subCommandId].slashOptions)continue;
                        let subCommand = loadedCommand.subCommands[subCommandId];
                        if(used.includes(subCommand.id))continue;
                        used.push(subCommand.id);
                        loadedCommand.slashOptions.push({
                            name: subCommandId,
                            description: subCommand.name,
                            options: subCommand.slashOptions,
                            type: 1,
                        })
                    }
                    // Discord forces me to do this dumb workaround because you can't have a slash command with sub commands and other commands
                    let otherOptions = Util.PatternToOptions(loadedCommand.pattern.filter((p)=>p.name != "command"), loadedCommand.argDescriptions);
                    if(otherOptions.length > 0 || loadedCommand.argDescriptions?.base) {
                        loadedCommand.slashOptions.push({
                            name: loadedCommand.argDescriptions?.["base"]?.name || "base",
                            description: loadedCommand.argDescriptions?.["base"]?.description || "Arguments that aren't on any subcommand",
                            options: otherOptions,
                            type: 1
                        });
                    }

                }else {
                    loadedCommand.slashOptions = Util.PatternToOptions(loadedCommand.pattern, loadedCommand.argDescriptions);
                }
            }

            this.bot.commandObjects[command] = loadedCommand;

            for (let i in loadedCommand.commands) {
                if (loadedCommand.commands.hasOwnProperty(i)) {
                    const commandName = loadedCommand.commands[i];
                    if (this.bot.commands[commandName] && !reload) {
                        this.bot.rabbit.event({
                            type: "warning",
                            payload: {
                                id: "commandOverwritten-" + commandName,
                                message: `Command ${commandName} already exists as '${this.bot.commandUsages[commandName].id}' and is being overwritten by ${command}!`
                            }
                        })
                    }

                    this.bot.commands[commandName] = command;
                    loadedCommand.crc = crc;
                    loadedCommand.id = command;
                    // TODO: this should be gone
                    this.bot.commandUsages[commandName] = loadedCommand;
                }
            }
        } catch (e) {
            console.error(e);
            this.bot.logger.error("failed to load command "+command);
            this.bot.logger.error(e);
            Sentry.captureException(e);
        }
    };

    /**
     * Loads sub commands for a specific command
     * @param loadedCommand
     * @param {string} path For nested commands, this is the require path
     * @returns {Promise<unknown>}
     */
    loadSubcommand(loadedCommand, path = "commands"){
        return new Promise((resolve)=>{
        this.bot.logger.log(`Loading nested commands for ${loadedCommand.name}`);
            fs.readdir(`${__dirname}/../${path}/${loadedCommand.nestedDir}`, async (err, files)=>{
                if(err) {
                    Sentry.captureException(err);
                    this.bot.logger.warn(`Unable to load ${loadedCommand.name} nested command dir ${loadedCommand.nestedDir}, ${err}`);
                    return;
                }
                loadedCommand.subCommands = {};
                for(let i = 0 ; i < files.length; i++){
                    try {
                        this.bot.logger.log(`Loading sub-command for ${loadedCommand.name}: ${loadedCommand.nestedDir}/${files[i]}`)
                        const command = require(`../${path}/${loadedCommand.nestedDir}/${files[i]}`);
                        // The highest premium tier gets a custom hosted bot, some commands are disabled for them so they can't fuck shit up
                        if (command.customDisabled && process.env.CUSTOM_BOT) continue;
                        if (command.init) {
                            this.bot.logger.log(`Init for ${loadedCommand.name}/${command.name}`);
                            await command.init(this.bot, loadedCommand);
                        }

                        command.id = files[i];
                        command.pattern = commandParser.BuildPattern(command.commands[0], command.usage).pattern;
                        command.slashOptions = Util.PatternToOptions(command.pattern, command.argDescriptions);

                        for (let i = 0; i < command.commands.length; i++) {
                            loadedCommand.subCommands[command.commands[i]] = command;
                        }

                        // TODO: recurse nesting commands
                    }catch(e){
                        console.log(e);
                        Sentry.captureException(e);
                        this.bot.logger.error(e);
                    }
                }
                if(loadedCommand.usage.indexOf("command") < 0)
                    loadedCommand.usage += " :command?";
                resolve(loadedCommand);
            })
        });
    }

    /**
     * Adds a command middleware
     * @param func
     * @param name
     * @param priority
     */
    addCommandMiddleware(func, name, priority = 0){
        if(!name){
            name = `Unnamed Middleware ${this.middlewareOrder.length+1}`;
        }
        this.commandMiddleware[name] = {priority, func};
        this.middlewareOrder.push(name);
        this.middlewareOrder.sort((a, b)=>this.commandMiddleware[b].priority-this.commandMiddleware[a].priority);
    }

    async runCommandMiddleware(context){
        for(let i = 0; i < this.middlewareOrder.length; i++){
            const middlewareData = this.commandMiddleware[this.middlewareOrder[i]];
            if(middlewareData.priority < 0)continue;
            const middlewareResult = await middlewareData.func(context, this.bot);

            if(!middlewareResult){
                console.log("Middleware ", this.middlewareOrder[i]);
                return false;
            }
        }
        return true;
    }

    /**
     * Runs a command given a specific context
     * @param {CommandContext} context
     * @returns {Promise<*|void|*>}
     */
    async runCommand(context) {
        Sentry.configureScope((scope) => {
            scope.setUser({
                username: context.user?.username,
                id: context.user?.id
            });
            scope.setTag("command", context.command);
        });

        const tx = Sentry.startTransaction({
            name: `Command ${context.command}`,
            sampled: true,
            data: {
                content: context.content,
                options: context.options,
            }
        })
        try {
            if (!this.bot.commandUsages[context.command]) {
                if (!context.guild || !this.bot.customFunctions.COMMAND[context.guild.id] || context instanceof CustomCommandContext) return console.log("Command doesn't exist 1");
                let customCommand = this.bot.customFunctions.COMMAND[context.guild.id][context.command]
                if (!customCommand) return console.log("Command doesn't exist 2", context.command);
                context.logPerformed();
                // todo: custom command context

                return await this.bot.util.runCustomFunction(customCommand, context)
            }

            context.logPerformed();

            if(!await this.runCommandMiddleware(context))return console.log("Middleware triggered"); // Middleware triggered

            if(context.commandData.middleware && !await context.commandData.middleware(context, this.bot))
                return console.log("Command specific middleware triggered");

            if(context.error) {
                if (context.commandData.handleError) {
                    return context.commandData.handleError(context, this.bot);
                }
                return context.sendLang({
                    content: `COMMAND_ERROR_${context.error.type.toUpperCase()}`,
                    ephemeral: true,
                    components: [this.bot.util.actionRow(this.bot.interactions.fullSuggestedCommand(context, `help ${context.command}`))]
                }, context.error.data);
            }

            this.bot.bus.emit("commandPerformed", context);
            Sentry.addBreadcrumb({
                category: "Command",
                level: Sentry.Severity.Info,
                message: context.command,
                data: {
                    username: context.user?.username,
                    id: context.user?.id,
                    message: context.message?.content,
                    options: context.options,
                    channel: context.channel?.id,
                    server:  context.guild?.id
                }
            });
            let commandId = this.bot.commands[context.command];
            if(context.commandData.subCommands){
                let parsedInput;

                let trueCommand = context.options.command?.toLowerCase();
                // Default to the help command
                if(!trueCommand || (trueCommand !== "help" && !context.commandData.subCommands[trueCommand])){
                    trueCommand = "help";
                }

                if(context.commandData.subCommands[trueCommand]){
                    if(context.args) {
                        parsedInput = commandParser.Parse(context.args.slice(2).join(" "), {
                            pattern: context.commandData.subCommands[trueCommand].pattern,
                            id: context.options.command
                        });

                        if(parsedInput.data)
                            context.options = {...parsedInput.data, ...context.options}
                    }
                    if (!parsedInput || !parsedInput.error)
                        return await context.commandData.subCommands[trueCommand].run(context, this.bot);
                }
                if(!this.bot.commandObjects[commandId].run || (context.options.command === "help")) {
                    return await this.bot.commandObjects["nestedCommandHelp.js"].run(context, this.bot);
                }
            }
            return await this.bot.commandObjects[commandId].run(context, this.bot);
        } catch (e) {
            console.log(e);
            let exceptionID = Sentry.captureException(e);
            let sentryButton = undefined;
            // Show the actual error indev
            if(process.env.VERSION === "indev" || context.getBool("showErrors")){
                exceptionID = e?.message;
            }else {
                sentryButton = [{
                    type: 1, components: [
                        {type: 2, style: 1, label: "Send Feedback", custom_id: `S${exceptionID}`}
                    ]
                }]
            }
            if(context.channel?.permissionsFor?.(this.bot.client.user.id)?.has("EMBED_LINKS")) {
                let errorEmbed = new Embeds.LangEmbed(context);
                errorEmbed.setColor("#ff0000");
                errorEmbed.setTitle("An Error Occurred");
                errorEmbed.setDescription(`Something went wrong whilst running your command. Try again later.\nThe developers have been notified of the problem, but if you require additional support, quote this code:\n\`\`\`\n${exceptionID}\n\`\`\``);
                context.reply({embeds: [errorEmbed], ephemeral: true, components: sentryButton});
            }else {
                context.reply({content: `Something went wrong whilst running your command. Try again later.\nThe developers have been notified of the problem, but if you require additional support, quote this code:\n\`\`\`\n${exceptionID}\n\`\`\``, ephemeral: true, components: sentryButton});
            }
            this.bot.bus.emit("commandFailed", e);
        } finally {
            if(tx){
                tx.finish();
            }
            this.bot.database.logCommand(context.user?.id, context.channel?.id, context.guild?.id || context.channel?.id, context.id, context.command || "Unknown", context.content, this.bot.client.user.id, context.interaction?.type || "message").catch((e)=>{
                Sentry.captureException(e);
                this.bot.logger.error(e);
                //this.bot.logger.log(context);
            })
        }
    }

    async onSentryFeedback(interaction, context){
        const eventId = interaction.customId.substring(2); //"S/"
        if(interaction.type === "MESSAGE_COMPONENT")
            return context.openForm({
                custom_id: interaction.customId,
                title: "Send Feedback",
                components: [{
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: "feedback",
                        label: "What were you doing before the error occurred",
                        style: 2,
                        min_length: 1,
                        required: true
                    }]
                }]
            });

        const feedback = interaction.components[0].components[0].value;

        const {status, data} = await axios.post(`https://sentry.io/api/0/projects/${config.get("Sentry.org")}/${config.get("Sentry.project")}/user-feedback/`, {
            name: context.user.tag,
            email: context.user.id+"@discord.com",
            comments: feedback,
            event_id: eventId,
        },{
            headers: {
                authorization: `Bearer ${config.get("Sentry.key")}`
            },
            validateStatus: (s)=>s < 500
        });

        if(status === 409)
            return context.send({content: "You've already sent feedback for this issue or the feedback window has expired.", ephemeral: true});

        if(status !== 200){
            this.bot.logger.log(data);
            return context.send({content: "Sorry, failed to send your feedback :(", ephemeral: true});
        }


        return context.send({content: "Thank you for your feedback!", ephemeral: true});
    };
}