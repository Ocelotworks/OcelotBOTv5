/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 15/08/2019
 * ╚════ ║   (ocelotbotv5) mixpanel
 *  ════╝
 */
const config = require('config');
const MatomoTracker = require('matomo-tracker');
module.exports = {
    name: "Mixpanel Integration",
    init: function(bot){
        bot.matomo = new MatomoTracker(config.get("Matomo.SiteID"), config.get("Matomo.URL"));
        let cachedUsers = [];

        bot.bus.on("commandPerformed", async function(command, message){
             let newVisit  = cachedUsers.indexOf(message.author.id) === -1;
            bot.matomo.track({
                action_name: "Command Performed",
                uid: message.author.id,
                url: `http://bot.ocelot.xyz/${command}`,
                ua: message.guild ? message.guild.name : "DM Channel",
                new_visit: newVisit,
                e_c: "Command",
                e_a: "Performed",
                e_n: command,
                e_v: 1,
                cvar: JSON.stringify({
                    1: ['Server ID', message.guild ? message.guild.id : "0"],
                    2: ['Server Name', message.guild ? message.guild.name : "DM Channel"],
                    3: ['Message', message.cleanContent],
                    4: ['Channel Name', message.channel.name],
                    5: ['Channel ID', message.channel.id]
                })
            });
        });

        bot.bus.on("commandRatelimited", function rateLimited(command, message){
            bot.matomo.track({
                action_name: "Command Rate Limited",
                uid: message.author.id,
                url: `http://bot.ocelot.xyz/${command}`,
                ua:  message.guild ? message.guild.name : "DM Channel",
                e_c: "Command",
                e_a: "Rate Limited",
                e_n: command,
                e_v: 1,
                cvar: JSON.stringify({
                    1: ['Server ID', message.guild ? message.guild.id : "0"],
                    2: ['Server Name', message.guild ? message.guild.name : "DM Channel"],
                    3: ['Message', message.cleanContent],
                    4: ['Channel Name', message.channel.name],
                    5: ['Channel ID', message.channel.id]
                })
            });
        });

    }
};