const config = require('config');
// const client = require('prom-client');
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

        function buildSchema(){
            const fields = [
                'messagesPerMinute',
                'messagesSentPerMinute',
                'commandsPerMinute',
                'messagesTotal',
                'commandsTotal',
                'servers',
                'usersTotal',
                'channelsTotal',
                'voiceConnections',
                'websocketPing',
                'warnings',
                'errors',
                'botRateLimits',
                'userRateLimits',
                'commandCacheSize',
                'connectionStatus',
                'reconnects'
            ];

            let output = [];
            for(let i = 0; i < fields.length; i++){
                let field = fields[i];
                let outputField = {
                    measurement: field,
                    fields: {},
                    tags: ["shard"]
                };
                if(field.startsWith('messages')){
                    outputField.fields.messages = Influx.FieldType.INTEGER
                }else if(field.startsWith('commands')){
                    outputField.fields.commands = Influx.FieldType.INTEGER
                }else{
                    outputField.fields[field] = Influx.FieldType.INTEGER;
                }
                output.push(outputField);
            }

            return output;

        }



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

            // client.collectDefaultMetrics({labels: {
            //         env: process.env.NODE_ENV,
            //         shard: bot.util.shard,
            // }})


            bot.rabbit.event({
                type: "heartbeat",
                payload: {
                    messagesPerMinute: bot.stats.messagesPerMinute,
                    shard: bot.util.shard
                }
            });

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