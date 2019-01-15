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
    usage: "settings help/set/list",
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
                    message.channel.send(`Successfully set the language to ${args[3]} (${bot.lang.strings[args[3].toLowerCase()].LANGUAGE_NAME})`);
                }else{
                    message.channel.send(`Invalid language. Do ${message.getSetting("prefix")}languages to see the available languages.`);
                }
            }
        }
    },
    run: async function(message, args, bot){
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!message.guild.available)
            return message.replyLang("GENERIC_GUILD_UNAVAILABLE");


        if(message.guild.ownerID === message.author.id || message.member.roles.find(function(role){
            return role.name.toLowerCase() === "bot master" || role.name.toLowerCase() === message.getSetting("settings.role").toLowerCase();
        })){
            if(!args[1]){
                message.channel.send(`:bangbang: Invalid usage. ${args[0]} list/set/help\nOr visit the Dashboard: https://ocelot.xyz/dash/\``);
            }else{
                let arg =  args[1].toLowerCase();
                if(arg === "list"){
                    let output = "```diff\nAvailable Settings:\n";
                    for(let setting in module.exports.settings){
                        if(module.exports.settings.hasOwnProperty(setting)) {
                            let settingInfo = module.exports.settings[setting];
                            output += `+${settingInfo.name}\n`;
                            output += `-${settingInfo.help}\n`;
                            output += ` Set with ${args[0]} set ${setting} ${settingInfo.value || "value"}\n`;
                            output += "----\n";
                        }
                    }
                    output += "\n```";
                    message.channel.send(output);
                }else if(arg === "set"){
                    if(args[2] && module.exports.settings[args[2].toLowerCase()]){
                        module.exports.settings[args[2].toLowerCase()].onSet(message, args, bot);
                    }else{
                        message.channel.send(`:bangbang: Invalid usage. Try ${args[0]} list`);
                    }
                }else if(arg === "help"){
                    if(args[2] && module.exports.settings[args[2].toLowerCase()]){
                        const setting = module.exports.settings[args[2].toLowerCase()];
                        message.channel.send(`${setting.name}:\n${setting.help}`);
                    }else{
                        message.channel.send(`:bangbang: You must supply a setting to get help on. Try ${args[0]} list`);
                    }
                }else{
                    message.channel.send(`:bangbang: Invalid usage. ${args[0]} list/set/help\nOr visit the Dashboard: https://ocelot.xyz/dash/`)
                }
            }
        }else{
            message.channel.send(`:bangbang: You need to have the role '${message.getSetting("settings.role")}' to use this command.\nOr visit the Dashboard: https://ocelot.xyz/dash/\``);
        }
    }
};