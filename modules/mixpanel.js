/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 15/08/2019
 * ╚════ ║   (ocelotbotv5) mixpanel
 *  ════╝
 */
const config = require('config');
const Mixpanel = require('mixpanel');
module.exports = {
    name: "Mixpanel Integration",
    init: function(bot){
        bot.mixpanel = Mixpanel.init(config.get("Mixpanel.token"));
        let cachedUsers = [];

        bot.bus.on("commandPerformed", async function(command, message){
            if(cachedUsers.indexOf(message.author.id) === -1) {
                cachedUsers.push(message.author.id);
                bot.mixpanel.people.set_once({
                    "$distinct_id": message.author.id,
                    "$name": message.author.tag,
                    "created": message.author.createdAt,
                    "commands_performed": (await bot.database.getUserStats(message.author.id))[0].commandCount
                });
            }

            bot.mixpanel.people.increment(message.author.id, 'commands_performed');

            bot.mixpanel.track(command+" Performed", {
                distinct_id: message.author.id,
                channel_id: message.channel.id,
                channel_name: message.channel.name,
                server_id: message.guild ? message.guild.id : "0",
                server_name: message.guild ? message.guild.name : "DM Channel",
                command: command,
                message: message.cleanContent
            });
        });

        bot.bus.on("commandRatelimited", function rateLimited(command, message){
            bot.mixpanel.track("Command RateLimited", {
                distinct_id: message.author.id,
                user: message.author.tag,
                channel_id: message.channel.id,
                channel_name: message.channel.name,
                server_id: message.guild ? message.guild.id : "0",
                server_name: message.guild ? message.guild.name : "DM Channel",
                command: command,
                message: message.cleanContent
            });
        });

    }
};