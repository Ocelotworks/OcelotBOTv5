const express = require('express');
module.exports = {
    name: "Statistics Aggregator",
    init: async function(bot){
        bot.stats = {
            messagesPerMinute: 0,
            messagesTotal: 0,
            messagesSentPerMinute: 0,
            commandsPerMinute: 0,
            commandsTotal: 0,
            warnings: 0,
            errors: 0,
            botRateLimits: 0,
            userRateLimits: 0,
            reconnects: 0,
       };



        bot.api.get('/stats', (req, res)=>{
            res.json(bot.stats)
        })

        bot.client.on("message", function(){
            bot.stats.messagesPerMinute++;
            bot.stats.messagesTotal++;
        });

        bot.bus.on("commandPerformed", function(){
            bot.stats.commandsPerMinute++;
            bot.stats.commandsTotal++;
        });

        bot.client.on("rateLimit", function(){
            bot.stats.botRateLimits++;
        });
        bot.client.on("error", function(){
            bot.stats.errors++;
        });
        bot.client.on("warn", function(){
            bot.stats.warnings++;
        });

        bot.client.on("reconnecting", function(){
            bot.stats.reconnects++;
        });

        setInterval(async function(){
            bot.stats.messagesPerMinute = 0;
            bot.stats.commandsPerMinute = 0;
            bot.stats.messagesSentPerMinute = 0;
            bot.stats.botRateLimits = 0;
            bot.stats.warnings = 0;
            bot.stats.errors = 0;
            bot.stats.reconnects = 0;

        }, 60000); //1 minute
    }
};