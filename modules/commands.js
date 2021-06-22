const Sentry = require('@sentry/node');
const {CustomCommandContext, InteractionCommandContext, MessageCommandContext} = require("../util/CommandContext");
const fs = require('fs');
const Util = require("../util/Util");
const {crc32} = require("crc");
const commandParser = require('command-parser').default;
module.exports = class Commands {

    bot;
    commandMiddleware = [];
    name = "Commands";
    
    constructor(bot){
        this.bot = bot;
    }

    init() {
        this.bot.commandObjects = {};
        this.bot.commandUsages = {};
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

        this.bot.client.on("ready", async ()=>{
            let commands = await this.bot.database.getCustomFunctionsForShard("COMMAND", this.bot.client.guilds.cache.keyArray());
            for(let i = 0; i < commands.length; i++){
                const command = commands[i];
                if(this.bot.customFunctions.COMMAND[command.server])
                    this.bot.customFunctions.COMMAND[command.server][command.trigger] = command.function;
                else
                    this.bot.customFunctions.COMMAND[command.server] = {[command.trigger]: command.function};
            }
        })

        this.bot.client.on("message", (message)=>{
            if (this.bot.drain || (message.author.bot && message.author.id !== "824045686600368189")) return;
            const prefix = message.getSetting("prefix");
            if (!prefix) return;//Bot hasn't fully loaded
            const prefixLength = prefix.length;
            if (!message.content.startsWith(prefix))
                return;
            const args = message.content.split(/\s+/g);
            const command = args[0].substring(prefixLength).toLowerCase();
            if(!this.bot.commandUsages[command])return;
            const context = new MessageCommandContext(this.bot, message, args, command);
            context.commandData = this.bot.commandUsages[command];
            if(context.commandData.pattern) {
                const parsedInput = commandParser.Parse(args.slice(1).join(" "), {pattern: context.commandData.pattern, id: command});
                if (parsedInput.error)
                    return message.channel.sendLang(`COMMAND_ERROR_${parsedInput.error.type.toUpperCase()}`, parsedInput.error.data);
                else
                    context.options = parsedInput.data;
            }

            return this.runCommand(context);
        });

        this.bot.client.on("interaction", (interaction)=>{
            if(!interaction.isCommand())return; // Not a command
            if(!this.bot.commandUsages[interaction.commandName])return console.log("Unknown command interaction", interaction.commandName); // No such command
            const context = new InteractionCommandContext(this.bot, interaction);
            context.commandData = this.bot.commandUsages[context.command];
            return this.runCommand(context);
        })


        this.bot.runCommand = this.runCommand.bind(this);
        this.bot.addCommandMiddleware = this.addCommandMiddleware.bind(this);


        // Disable in NSFW channels
        this.addCommandMiddleware((context)=>{
            if (!context.channel?.nsfw && context.commandData.categories.indexOf("nsfw") > -1) {
                context.reply({content: `:warning: This command can only be used in NSFW channels.`, ephemeral: true});
                return false;
            }
            return true;
        });

        // Override commands
        this.addCommandMiddleware((context)=> {
            if (context.getSetting(`${context.command}.override`)) {
                context.send(context.getSetting(`${context.command}.override`));
                return false;
            }
            return true;
        });

        this.addCommandMiddleware((context)=>{
            if(!context.message)return true; // TODO: interaction ban
            return !this.bot.checkBan(context.message)
        });

        // Ratelimits
        this.addCommandMiddleware((context)=>{
            if (!this.bot.isRateLimited(context.author?.id, context.guild?.id || "global")) return true;
            this.bot.bus.emit("commandRatelimited", context);
            this.bot.logger.warn(`${context.user.username} (${context.user.id}) in ${context.guild?.name || "DM"} (${context.guild?.id || context.channel?.id}) was ratelimited`);
            if (this.bot.rateLimits[context.user.id] < context.getSetting("rateLimit.threshold")) {
                const now = new Date();
                const timeDifference = now - this.bot.lastRatelimitRefresh;
                let timeLeft = 60000 - timeDifference;
                context.replyLang({
                    content: "COMMAND_RATELIMIT",
                    ephemeral: true
                }, {timeLeft: this.bot.util.prettySeconds(timeLeft / 1000, context.guild?.id, context.author?.id)});
                this.bot.rateLimits[context.user.id] += context.commandData.rateLimit || 1;
            }
            return false;
        })


        // Notices
        this.addCommandMiddleware((context)=>{
            if(!context.guild)return true;
            if (context.getSetting("notice")) {
                context.send(context.getSetting("notice"));
                this.bot.database.deleteSetting(context.guild.id, "notice");
                if (this.bot.config.cache[context.guild.id])
                    this.bot.config.cache[context.guild.id].notice = null;
            }
            return true;
        })

        // Message permissions
        this.addCommandMiddleware(async (context)=>{
            if (context.channel.permissionsFor) {
                const permissions = await context.channel.permissionsFor(this.bot.client.user);

                if (!permissions || !permissions.has("SEND_MESSAGES")) {
                    this.bot.logger.log({
                        type: "commandPerformed",
                        success: false,
                        outcome: "No Permissions"
                    })
                    const dm = await context.user.createDM();
                    dm.send(":warning: I don't have permission to send messages in that channel.");
                    //TODO: COMMAND_NO_PERMS lang key
                    return false;
                }

                if (context.commandData.requiredPermissions && !permissions.has(context.commandData.requiredPermissions)) {
                    let permission = context.commandData.requiredPermissions.map((p)=>this.bot.util.permissionsMap[p]).join();
                    context.replyLang({content: "ERROR_NEEDS_PERMISSION", ephemeral: true}, {permission});
                    return false;
                }
            }
            return true;
        })

        this.loadCommands();
    }

    loadCommands () {
        fs.readdir(`${__dirname}/../commands`, (err, files)=>{
            if (err) {
                this.bot.logger.error("Error reading from commands directory");
                console.error(err);
                Sentry.captureException(err);
            } else {
                for (const command of files) {
                    if (!fs.lstatSync(`${__dirname}/../commands/${command}`).isDirectory()) {
                        this.loadCommand(command);
                    }
                }
                this.bot.bus.emit("commandLoadFinished");
                this.bot.logger.log("Finished loading commands.");

                this.bot.client.once("ready", () => {
                    this.bot.rabbit.event({
                        type: "commandList",
                        payload: this.bot.commandUsages
                    })
                })
            }
        });
    }

    async loadCommand(command, reload) {
        try {
            const module = `${__dirname}/../commands/${command}`;
            if (reload) {
                delete require.cache[require.resolve(module)];
            }
            let crc = crc32(fs.readFileSync(module, 'utf8')).toString(16);
            let loadedCommand = require(module);
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

            if(loadedCommand.nestedDir){
                loadedCommand = await this.loadSubcommand(loadedCommand);
            }

            loadedCommand.pattern = commandParser.BuildPattern(command, loadedCommand.usage).pattern;
            if(!loadedCommand.slashHidden)
            //if(!loadedCommand.pattern.length > 0) // TODO
                loadedCommand.slashOptions = Util.PatternToOptions(loadedCommand.pattern, loadedCommand.argDescriptions);


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
                    this.bot.commands[commandName] = this.bot.commandObjects[command].run;
                    this.bot.commandUsages[commandName] = {
                        id: command,
                        crc,
                        ...loadedCommand,
                    };
                }
            }
        } catch (e) {
            console.error(e);
            this.bot.logger.error("failed to load command");
            this.bot.logger.error(e);
            Sentry.captureException(e);
        }
    };

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
                        if (command.customDisabled && process.env.CUSTOM_BOT) continue;
                        if (command.init) {
                            this.bot.logger.log(`Init for ${loadedCommand.name}/${command.name}`);
                            await command.init(this.bot, loadedCommand);
                        }

                        command.pattern = commandParser.BuildPattern(command.commands[0], command.usage).pattern;

                        // TODO: Subcommands
                        loadedCommand.slashHidden = true;

                        for (let i = 0; i < command.commands.length; i++) {
                            console.log("Loading ", command.commands[i]);
                            loadedCommand.subCommands[command.commands[i]] = command;
                        }

                        console.log(loadedCommand.subCommands);

                        // TODO: recurse nesting commands
                    }catch(e){
                        console.log(e);
                        Sentry.captureException(e);
                        this.bot.logger.error(e);
                    }
                }
                console.log( loadedCommand.subCommands);
                loadedCommand.usage += " :command?";
                resolve(loadedCommand);
            })
        });
    }

    addCommandMiddleware(func){
        this.commandMiddleware.push(func);
    }

    async runCommandMiddleware(context){
        for(let i = 0; i < this.commandMiddleware.length; i++){
            const middlewareResult = await this.commandMiddleware[i](context);
            if(!middlewareResult)return false;
        }
        return true;
    }

    /**
     * Runs a command
     * @param {CommandContext} context
     * @returns {Promise<*|void|*>}
     */
    async runCommand(context) {
        Sentry.configureScope((scope) => scope.setUser({
            username: context.user.username,
            id: context.user.id
        }));

        if (!this.bot.commands[context.command]) {
            if (!context.guild || !this.bot.customFunctions.COMMAND[context.guild.id] || context instanceof CustomCommandContext) return;
            let customCommand = this.bot.customFunctions.COMMAND[context.guild.id][context.command]
            if (!customCommand) return;
            context.logPerformed();
            // todo: custom command context
            return await this.bot.util.runCustomFunction(customCommand, context.message)
        }


        if(!await this.runCommandMiddleware(context))return console.log("Middleware triggered"); // Middleware triggered

        context.logPerformed();

        // TODO: This event
        //this.bot.bus.emit("commandPerformed", context);
        Sentry.addBreadcrumb({
            category: "Command",
            level: Sentry.Severity.Info,
            message: context.command,
            data: {
                username: context.user.username,
                id: context.user.id,
                // message: message.content,
                channel: context.channel.id,
                server:  context.guild?.id || "DM Channel"
            }
        });

        try {
            if(context.commandData.subCommands){
                let parsedInput;
                if(context.options.command && context.commandData.subCommands[context.options.command]){
                    if(context.args) {
                        parsedInput = commandParser.Parse(context.args.slice(2).join(" "), {
                            pattern: context.commandData.subCommands[context.options.command].pattern,
                            id: context.options.command
                        });

                        if(parsedInput.data) {
                            console.log(parsedInput.data);
                            context.options = {...parsedInput.data, ...context.options}
                        }

                    }
                    if (!parsedInput || !parsedInput.error)
                        return await context.commandData.subCommands[context.options.command].run(context, this.bot);
                }
                if(!this.bot.commands[context.command]) {
                    // TODO: nested help
                    return context.reply("TODO: Nested help");
                }
            }
            console.log(context.commandData.subCommands);
            console.log(context.options.command);
            console.log("no sub commands");
            return await this.bot.commands[context.command](context, this.bot);
        } catch (e) {
            console.log(e);
            context.channel.stopTyping(true);
            context.reply({content: "Something went horribly wrong. Try again later.", ephemeral: true});
            this.bot.bus.emit("commandFailed", e);
            Sentry.captureException(e);
        } finally {
            this.bot.database.logCommand(context.user.id, context.channel.id, context.guild?.id || context.channel.id, context.message ? context.message.id : context.interaction.id, context.command, context.message ? context.message.content : "Interaction", this.bot.client.user.id).catch((e)=>{
                Sentry.captureException(e);
                this.bot.logger.error(e);
            })
        }
    }
}

//
// module.exports = {
//     name: "Commands",
//     init: function (bot) {
//
//    
//         }
//
//
//         this.bot.loadCommand = function loadCommand(command, reload) {
//             try {
//                 const module = `${__dirname}/../commands/${command}`;
//                 if (reload) {
//                     delete require.cache[require.resolve(module)];
//                 }
//                 let crc = crc32(fs.readFileSync(module, 'utf8')).toString(16);
//                 let loadedCommand = require(module);
//                 if (loadedCommand.init && !reload) {
//                     try {
//                         loadedCommand.init(bot);
//                     } catch (e) {
//                         Sentry.captureException(e);
//                         this.bot.logger.error(e);
//                         if (this.bot.client && this.bot.client.shard) {
//                             this.bot.rabbit.event({
//                                 type: "warning", payload: {
//                                     id: "badInit-" + command,
//                                     message: `Couldn't initialise command ${command}:\n${e.message}`
//                                 }
//                             });
//                         }
//                     }
//                 } else if (loadedCommand.init) {
//                     this.bot.logger.warn(`Command ${command} was reloaded, but init was not run.`);
//                 }
//                 this.bot.logger.log(`Loaded command ${loadedCommand.name} ${`(${crc})`.gray}`);
//
//                 if (reload) {
//                     if (this.bot.commandUsages[loadedCommand.commands[0]]) {
//                         let oldCrc = this.bot.commandUsages[loadedCommand.commands[0]].crc;
//                         if (oldCrc !== crc)
//                             this.bot.logger.log(`Command ${command} version has changed from ${oldCrc} to ${crc}.`);
//                         else
//                             this.bot.logger.warn(`Command ${command} was reloaded but remains the same version.`);
//                     }
//                 }
//
//                 this.bot.commandObjects[command] = loadedCommand;
//
//                 for (let i in loadedCommand.commands) {
//                     if (loadedCommand.commands.hasOwnProperty(i)) {
//                         const commandName = loadedCommand.commands[i];
//                         if (this.bot.commands[commandName] && !reload) {
//                             this.bot.rabbit.event({
//                                 type: "warning",
//                                 payload: {
//                                     id: "commandOverwritten-" + commandName,
//                                     message: `Command ${commandName} already exists as '${this.bot.commandUsages[commandName].id}' and is being overwritten by ${command}!`
//                                 }
//                             })
//                         }
//                         this.bot.commands[commandName] = this.bot.commandObjects[command].run;
//                         this.bot.commandUsages[commandName] = {
//                             id: command,
//                             crc,
//                             ...loadedCommand,
//                         };
//                     }
//                 }
//             } catch (e) {
//                 this.bot.logger.error("failed to load command");
//                 this.bot.logger.error(e);
//                 Sentry.captureException(e);
//             }
//         };
//
//         // module.exports.loadPrefixCache(bot);
//         module.exports.loadCommands(bot);
//     },
//     loadPrefixCache: async function (bot) {
//         const prefixes = await this.bot.database.getPrefixes();
//         for (let i = 0; i < prefixes.length; i++) {
//             const prefix = prefixes[i];
//             this.bot.prefixCache[prefix.server] = prefix.prefix;
//         }
//         this.bot.logger.log("Populated prefix cache with " + Object.keys(this.bot.prefixCache).length + " servers");
//     },
//     loadCommands: function (bot) {
//         fs.readdir(`${__dirname}/../commands`, function readCommands(err, files) {
//             if (err) {
//                 this.bot.logger.error("Error reading from commands directory");
//                 console.error(err);
//                 Sentry.captureException(err);
//             } else {
//                 for (const command of files) {
//                     if (!fs.lstatSync(`${__dirname}/../commands/${command}`).isDirectory()) {
//                         this.bot.loadCommand(command);
//                     }
//                 }
//                 this.bot.bus.emit("commandLoadFinished");
//                 this.bot.logger.log("Finished loading commands.");
//
//                 this.bot.client.once("ready", () => {
//                     this.bot.rabbit.event({
//                         type: "commandList",
//                         payload: this.bot.commandUsages
//                     })
//                 })
//             }
//         });
//     }
//};