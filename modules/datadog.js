/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) datadog
 *  ════╝
 */
var StatsD = require('node-dogstatsd').StatsD;
module.exports = {
    name: "Datadog Integration",
    init: function(bot){
        bot.dogstatsd = new StatsD();

        bot.client.on("raw", function(event){
           bot.dogstatsd.increment("ocelotbot.event",1,['shard:'+bot.client.shard.id, 'event:'+event.t]);
        });

        bot.client.on("message", function(){
            bot.dogstatsd.increment("ocelotbot.message",1,['shard:'+bot.client.shard.id] );
        });

        bot.bus.on("commandPerformed", async function(command){
            bot.dogstatsd.increment('ocelotbot.command', 1, ['shard:'+bot.client.shard.id, 'command:'+command]);
        });

        bot.bus.on("commandRatelimited", function rateLimited(command, message){
            bot.dogstatsd.increment('ocelotbot.command.ratelimit',1,['shard:'+bot.client.shard.id, 'command:'+command]);
        });

        setInterval(function(){
            bot.dogstatsd.timing('ocelotbot.ping', bot.client.pings[0], 1,  ['shard:'+bot.client.shard.id]);
            bot.dogstatsd.histogram('ocelotbot.users', bot.client.users.size, 1,  ['shard:'+bot.client.shard.id]);
            bot.dogstatsd.histogram('ocelotbot.guilds', bot.client.guilds.size, 1,  ['shard:'+bot.client.shard.id]);
            bot.dogstatsd.histogram('ocelotbot.channels', bot.client.channels.size, 1,  ['shard:'+bot.client.shard.id]);
            bot.dogstatsd.histogram('ocelotbot.emojis', bot.client.emojis.size, 1,  ['shard:'+bot.client.shard.id]);
        }, 60000);

    }
};