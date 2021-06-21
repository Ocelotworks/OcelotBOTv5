module.exports = {
    name: "Bot Settings",
    usage: "settings help/set/list/enableCommand/disableCommand",
    categories: ["meta"],
    commands: ["settings", "config"],
    settings: {
        prefix: {
            name: "Prefix",
            help: "The character that goes before the command, e.g !settings (Default !)",
            setting: "prefix",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3]) {
                    //Idiot guard
                    if(args[3].toLowerCase() === "value")
                        return message.replyLang("SETTINGS_PREFIX_IDIOT", {arg: args[0]});

                    await bot.config.set(message.guild.id, "prefix", args[3]);
                    message.replyLang("SETTINGS_PREFIX_SET", {prefix: args[3]});
                }else{
                    message.replyLang("SETTINGS_PREFIX_NONE", {arg: args[0]});
                }
            }
        },
        wholesome: {
            name: "Wholesome mode",
            help: "Makes the  bot more wholesome",
            setting: "wholesome",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.util.bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bot.util.bools[args[3].toLowerCase()];
                    await bot.config.set(message.guild.id, "wholesome", bool);
                    message.channel.send((bool? "Enabled" : "Disabled")+" wholesome mode.");
                   // message.replyLang(`SETTINGS_NSFW_${bool ? "ENABLE":"DISABLE"}`);
                }else{
                    message.channel.send("You must enter a value either true or false.");
                    //message.replyLang("SETTINGS_NSFW_NONE", {arg: args[0]});
                }
            }
        },
        disablensfw: {
            name: "Disable NSFW",
            help: "Disable NSFW commands such as !pornsuggest",
            setting: "disablensfw",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.util.bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bot.util.bools[args[3].toLowerCase()];
                    await bot.config.set(message.guild.id, "allowNSFW", bool);
                    message.replyLang(`SETTINGS_NSFW_${bool ? "DISABLE":"ENABLE"}`);
                }else{
                    message.replyLang("SETTINGS_NSFW_NONE", {arg: args[0]});
                }
            }
        },
        seriousporn: {
            name: "Serious Porn Suggest mode",
            help: "Give actual suggestions with !pornsuggest instead of joke ones.",
            setting: "seriousporn",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.util.bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bot.util.bools[args[3].toLowerCase()];
                    await bot.config.set(message.guild.id, "pornsuggest.serious", bool);
                    message.replyLang(`SETTINGS_SERIOUS_PORN_${bool ? "ENABLE":"DISABLE"}`);
                }else {
                    message.replyLang("SETTINGS_SERIOUS_PORN_NONE", {arg: args[0]});
                }
            }
        },
        lang: {
            name: "Bot Language",
            help: "Choose the language OcelotBOT should respond in. Check !languages for a list",
            setting: "lang",
            value: "language-code",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.lang.strings[args[3].toLowerCase()]) {
                    await bot.config.set(message.guild.id, "lang", args[3].toLowerCase());
                    message.replyLang("SETTINGS_LANGUAGE_SET", {code: args[3], name: bot.lang.strings[args[3].toLowerCase()].LANGUAGE_NAME});
                }else{
                    message.replyLang("SETTINGS_LANGUAGE_NONE", {arg: args[0]});
                }
            }
        },
        role: {
            name: "Settings Role",
            help: "The role needed to use this command.",
            setting: "settings.role",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                let roleName = args[3];
                if(message.mentions.roles.size > 0)
                    roleName = message.mentions.roles.first().name;

                if(!roleName)
                    return message.replyLang("SETTINGS_ROLE_INVALID");

                await bot.config.set(message.guild.id, "settings.role", roleName.toLowerCase());
                message.replyLang("SETTINGS_ROLE_SET", {roleName});
            }
        },
        timezone: {
            name: "Timezone",
            help: "The timezone used for !time",
            setting: "time.zone",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                let timezone = args[3];
                if(bot.util.timezones[timezone] || bot.util.timezoneRegex.exec(timezone)){
                    await bot.config.set(message.guild.id, "time.zone", timezone);
                    message.replyLang("SETTINGS_TIMEZONE_SET", {timezone});
                }else{
                    message.replyLang("SETTINGS_TIMEZONE_NONE");
                }
            }
        }
    },
    init: function(bot){
        bot.util.standardNestedCommandInit('settings');

        // Disable if allowNSFW is turned on
        bot.addCommandMiddleware(async (context)=>{
            if (context.getBool("allowNSFW") && context.commandData.categories.indexOf("nsfw") > -1) {
                if(context.interaction){
                    context.reply({ephemeral: true, content: "NSFW commands are disabled in this server."});
                    return false;
                }
                const dm = await context.author.createDM();
                dm.send(`NSFW commands are disabled in this server.`);
                this.bot.logger.log(`NSFW commands are disabled in this server (${context.guild.id}): ${context}`);
                return false;
            }
            return true;
        });

        // Disable commands that are disabled
        bot.addCommandMiddleware((context)=>{
            if (context.getBool(`${context.command}.disable`)) {
                bot.logger.log(`${context.command} is disabled in this server: ${context.command}`);
                return false;
            }
            return true;
        });

        // Wholesome mode
        bot.addCommandMiddleware((context)=>{
            if (!context.getBool("wholesome"))return true;
            if (context.commandData.categories.indexOf("nsfw") > -1 || context.commandData.unwholesome) {
                context.reply({content: ":star:  This command is not allowed in wholesome mode!", ephemeral: true});
                return false;
            }
            let content = context.message ? context.message.content : context.interaction.options.map((o)=>o.value).join(" ");
            if (bot.util.swearRegex.exec(content)) {
                context.reply({content: "No swearing!", ephemeral: true});
                return false;
            }
            return true;
        });

        // Disable/restriction channels
        bot.addCommandMiddleware(async (context)=>{
            const channelDisable = context.getSetting(`${context.command}.channelDisable`);
            const channelRestriction = context.getSetting(`${context.command}.channelRestriction`);
            if (channelDisable?.indexOf(context.channel.id) > -1 || channelRestriction?.indexOf(context.channel.id) === -1) {
               if(context.interaction){
                 context.reply({content: `${context.command} is disabled in that channel`, ephemeral: true});
               } else if (context.getBool("sendDisabledMessage")) {
                    const dm = await context.author.createDM();
                    dm.send(`${context.command} is disabled in that channel`);
                    //TODO: COMMAND_DISABLED_CHANNEL
                    this.bot.logger.log(`${context.command} is disabled in that channel (${context.channel.id})`);
                }
                return false;
            }
            return true;
        });





    },
    run: async function(message, args, bot){
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!message.guild.available)
            return message.replyLang("GENERIC_GUILD_UNAVAILABLE");

        console.log(message);
        if(bot.util.canChangeSettings(message)){
            let arg =  args[1] && args[1].toLowerCase();
            if(arg && arg === "help" && args[2]){
                if(module.exports.settings[args[2].toLowerCase()]){
                    const setting = module.exports.settings[args[2].toLowerCase()];
                    message.channel.send(`${setting.name}:\n${setting.help}`);
                }else{
                    message.replyLang("SETTINGS_HELP_SETTING");
                }
            }else {
                bot.util.standardNestedCommand(message, args, bot, 'settings', module.exports);
            }
            return;
        }
        if(message.getSetting("settings.role") === "-")
            return message.channel.send("You must have Administrator permissions to use this command.");
        return message.replyLang("SETTINGS_NO_ROLE", {role: message.getSetting("settings.role")});
    }
};