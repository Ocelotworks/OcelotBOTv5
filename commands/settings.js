const Discord = require('discord.js');
module.exports = {
    name: "Change Settings",
    usage: "settings <set/help/list>",
    commands: ["settings"],
    categories: ["meta"],
    init: async function init(bot){
      module.exports.settings = {
        prefix: {
            explanation: "SETTINGS_PREFIX",
                format: function format(value){
                return `\`${value}\``;
            },
            onSet: function(newVal, message){
                //bot.prefixCache[message.guild.id] = newVal;
               // bot.ipc.emit("broadcast", {event: "clearPrefixCache"});
            },
        },
        enableAutoReactions: {
            explanation: "SETTINGS_REACTIONS",
            format: function format(value){
                return !!value;
            }
        },
        enableAutoReplies: {
            explanation:"SETTINGS_REPLIES",
            format: function format(value){
                return !!value;
            }
        },
        allowNSFW: {
            explanation: "SETTINGS_NSFW",
            format: function format(value){
                return !!value;
            }
        },
        language: {
            //explanation: "The language to respond to commands in. To view the available languages, type !language",
            explanation: "SETTINGS_LANGUAGE",
            format: function (value) {
                return `${bot.lang.getTranslationFor(value, "LANGUAGE_FLAG")} \`${value}\``
            },
            onSet: function (newVal, message) {
                bot.lang.languageCache[message.guild.id] = newVal;
            }
        }
      }
    },
    run:  function(message, args, bot){
        if(!(message.channel instanceof Discord.TextChannel)){
            message.replyLang("SETTINGS_DM_CHANNEL");
        }else if(message.member.roles.exists("name", "Bot Controller") || message.member.roles.exists("name", "Bot Master") || message.guild.ownerID === message.author.id){
            if(!args[1] || !module.exports.subCommands[args[1]]){
                message.replyLang("SETTINGS_USAGE");
            }else{
                module.exports.subCommands[args[1]](message,args,bot);
            }
        }else{
            message.replyLang("SETTINGS_NO_ROLE");
        }
    },
    subCommands: {
        list: async function(message, args, bot){
            const serverInfo = (await bot.database.getServer(message.guild.id))[0];
            let output = await bot.lang.getTranslation(message.guild.id, "SETTINGS_AVAILABLE");
            for(var i in serverInfo){
                if(serverInfo.hasOwnProperty(i) && module.exports.settings[i]){
                    output += `**${i}** - ${module.exports.settings[i].format(serverInfo[i])}\n`
                }
            }

            message.channel.send(output);
        },
        set: async function(message, args, bot){
            if(args.length < 4){
                message.replyLang("SETTINGS_INVALID_ARGUMENTS");
            }else if(Object.keys(module.exports.settings).indexOf(args[2]) > -1){
                try{
                    await bot.database.setServerSetting(message.guild.id, args[2], args[3] === "true" || args[3] === "false" ? args[3] === "true" : args[3]);
                    message.replyLang("SETTINGS_SET_SUCCESS", {setting: args[2], value: args[3]});
                    if(module.exports.settings[args[2]].onSet)
                        module.exports.settings[args[2]].onSet(args[3], message);
                }catch(err){
                    message.replyLang("SETTINGS_SET_ERROR");
                }
            }else{
                message.replyLang("SETTINGS_INVALID_SETTING");
            }
        },
        "help": async function(message, args, bot){
            if(Object.keys(module.exports.settings).indexOf(args[2]) > -1){
                message.channel.send(await bot.lang.getTranslation(message.guild.id, module.exports.settings[args[2]].explanation));
            }else{
                message.replyLang("SETTINGS_INVALID_SETTING");
            }
        }
    }
};