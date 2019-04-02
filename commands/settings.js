const bools = {
    "true": true,
    "false": false,
    "1": true,
    "0": false,
    "on": true,
    "off": false,
    "yes": true,
    "no": false,
    "allowed": true,
    "disallowed": false
};
module.exports = {
    name: "Bot Settings",
    usage: "settings help/set/list/enableCommand/disableCommand",
    categories: ["meta"],
    requiredPermissions: ["ATTACH_FILES"],
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
                    await bot.database.setSetting(message.guild.id, "prefix", args[3]);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`Successfully set the prefix to **${args[3]}**.\nFor example, the help command is now: ${args[3]}help\nIf you've managed to set a prefix you can't use, send a message to Big P#1843`);
                }else{
                    message.channel.send(`You must include a prefix, for example **${args[0]} set prefix !** would set the prefix to !`);
                }
            }
        },
        allownsfw: {
            name: "Allow NSFW",
            help: "Allow NSFW commands such as !pornsuggest",
            setting: "allownsfw",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "allowNSFW", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`${bool ? "Enabled" : "Disabled"} NSFW commands.`);
                }else{
                    message.channel.send(`Try **${args[0]} set allownsfw false** to turn NSFW commands off.`);
                }
            }
        },
        bypassnsfw: {
            name: "Bypass NSFW check",
            help: "Allow NSFW commands in any channel regardless of NSFW status",
            setting: "bypassnsfw",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "bypassNSFWCheck", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`${bool ? "Enabled" : "Disabled"} NSFW bypass.`);
                }else{
                    message.channel.send(`Try **${args[0]} set bypassnsfw false** to turn NSFW commands off.`);
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
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "pornsuggest.serious", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`${bool ? "Enabled" : "Disabled"} serious porn suggestions.`);
                }else{
                    message.channel.send(`Try **${args[0]} set seriousporn false** to turn serious porn suggestions off.`);
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
                    await bot.database.setSetting(message.guild.id, "lang", args[3].toLowerCase());
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`:white_check_mark: Successfully set the language to ${args[3]} (${bot.lang.strings[args[3].toLowerCase()].LANGUAGE_NAME})`);
                }else{
                    message.channel.send(`:bangbang: Invalid language. Do ${message.getSetting("prefix")}languages to see the available languages.`);
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
                    return message.channel.send(":bangbang: You must either enter a role name (e.g bot controller) or @mention the role you want.");

                await bot.database.setSetting(message.guild.id, "settings.role", roleName.toLowerCase());
                await bot.config.reloadCacheForServer(message.guild.id);
                message.channel.send(`:white_check_mark: Successfully set the settings role to '${roleName}'.`);
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
                    await bot.database.setSetting(message.guild.id, "time.zone", timezone);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.channel.send(`:white_check_mark: Successfully set the timezone to '${timezone}'.`);
                }else{
                    message.channel.send(":bangbang: Invalid Timezone. Try something like CST or GMT+2");
                }
            }
        }
    },
    init: function(bot){
        bot.util.standardNestedCommandInit('settings');
    },
    run: async function(message, args, bot){
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!message.guild.available)
            return message.replyLang("GENERIC_GUILD_UNAVAILABLE");

        if(message.guild.ownerID === message.author.id || message.member.roles.find(function(role){
            return role.name.toLowerCase() === "bot master" || role.name.toLowerCase() === message.getSetting("settings.role").toLowerCase();
        })){
            let arg =  args[1] && args[1].toLowerCase();
            if(arg && arg === "help" && args[2]){
                if(module.exports.settings[args[2].toLowerCase()]){
                    const setting = module.exports.settings[args[2].toLowerCase()];
                    message.channel.send(`${setting.name}:\n${setting.help}`);
                }else{
                    message.channel.send(`:bangbang: You must supply a valid setting to get help on. Try ${args[0]} list`);
                }
            }else {
                bot.util.standardNestedCommand(message, args, bot, 'settings', module.exports);
            }
        }else{
            message.channel.send(`:bangbang: You need to have the role **'${message.getSetting("settings.role")}'* or be the owner of the guild to use this command.`);
        }
    }
};