/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 26/04/2019
 * ╚════ ║   (ocelotbotv5) usersettings
 *  ════╝
 */
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
    name: "User Settings",
    usage: "usersettings help/set/list/enableCommand/disableCommand",
    categories: ["meta"],
    premium: true,
    requiredPermissions: [],
    commands: ["usersettings", "userconfig"],
    settings: {
        lang: {
            name: "Bot Language",
            help: "Choose the language OcelotBOT should respond to you in. Check !languages for a list",
            setting: "lang",
            value: "language-code",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.lang.strings[args[3].toLowerCase()]) {
                    await bot.database.setUserSetting(message.author.id, "lang", args[3]);
                    bot.client.shard.send({type: "reloadUserConfig"});
                    message.channel.send(`:white_check_mark: Successfully set your language to ${args[3]} (${bot.lang.strings[args[3].toLowerCase()].LANGUAGE_NAME})`);
                }else{
                    message.channel.send(`:bangbang: Invalid language. Do ${message.getSetting("prefix")}languages to see the available languages.`);
                }
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
                    await bot.database.setUserSetting(message.author.id, "time.zone", timezone);
                    bot.client.shard.send({type: "reloadUserConfig"});
                    message.channel.send(`:white_check_mark: Successfully set your timezone to '${timezone}'.`);
                }else{
                    message.channel.send(":bangbang: Invalid Timezone. Try something like CST or GMT+2");
                }
            }
        },
        disabledmessage: {
            name: "Send Disabled Command Message",
            help: "Send a DM when the command you're using is disabled in that channel",
            setting: "sendDisabledMessage",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setUserSetting(message.author.id, "sendDisabledMessage", bool);
                    bot.client.shard.send({type: "reloadUserConfig"});
                    message.channel.send(`${bool ? "Enabled" : "Disabled"} Disabled Command Messages.`);
                }else{
                    message.channel.send(`Try **${args[0]} set disabledmessage false** to turn Disabled Command Messages off.`);
                }
            }
        },
        bulge: {
            name: "Bulge Amount",
            help: "Amount to bulge by with !bulge",
            setting: "bulge.amount",
            value: "value between 0 and 10",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(!args[3])
                    return message.channel.send("You must enter a number to bulge by.");
                if(isNaN(args[3]))
                    return message.channel.send("You must enter a **number** to bulge by.");

                if(args[3] < 0)
                    return message.channel.send("The number must be bigger than 0.");

                if(args[3] > 10)
                    return message.channel.send("The number can't be bigger than 10");

                await bot.database.setUserSetting(message.author.id, "bulge.amount", parseInt(args[3]));
                bot.client.shard.send({type: "reloadUserConfig"});
                message.channel.send(`Set the bulge amount to ${args[3]}`);
            }
        },
        "8ball": {
            name: "Rig 8-ball",
            help: "Rig the 8ball command",
            setting: "8ball.rig",
            value: "value between 0 and 14 (By default numbers below 10 are yes, 10 and above are no)",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(!args[3])
                    return message.channel.send("You must enter a number to bulge by.");
                if(isNaN(args[3]))
                    return message.channel.send("You must enter a **number** to bulge by.");

                if(args[3] < 0)
                    return message.channel.send("The number must be bigger than 0.");

                if(args[3] > 14)
                    return message.channel.send("The number can't be bigger than 10");

                await bot.database.setUserSetting(message.author.id, "8ball.rig", parseInt(args[3]));
                bot.client.shard.send({type: "reloadUserConfig"});
                message.channel.send(`Rigged 8ball to say ${await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "8BALL_RESPONSE_"+parseInt(args[3]), {}, message.author.id)}`);
            }
        },

    },
    init: function(bot){
        //Aren't i the dogs bollocks reusing an entire nested command set
       // bot.util.standardNestedCommandInit('settings');
    },
    run: async function(message, args, bot){
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
    }
};