const Influx = require("influx");
const config = require('config');
const os = require('os');
module.exports = {
    name: "Statistics Aggregator",
    init: async function(bot){
        bot.stats = {
            messagesPerMinute: 0,
            messagesTotal: 0,
            commandsPerMinute: 0,
            commandsTotal: 0,
            warnings: 0,
            errors: 0,
            botRateLimits: 0,
            userRateLimits: 0,
            timing: {
                waiting: {},
                counts: {},
                totals: {}
            },
            time: function time(name){
                const now = new Date().getTime();
                if(bot.stats.timing.waiting[name]){
                    if(bot.stats.timing.totals[name]){
                        bot.stats.timing.totals[name] += now-bot.stats.timing.waiting[name];
                        bot.stats.timing.counts[name]++;
                    }else{
                        bot.stats.timing.totals[name] = now-bot.stats.timing.waiting[name];
                        bot.stats.timing.counts[name] = 1;
                     }
                    delete bot.stats.timing.waiting[name];
                }else{
                    bot.stats.timing.waiting[name] = now;
                }
            }
       };

        function buildSchema(){
            const fields = [
                'messagesPerMinute',
                'commandsPerMinute',
                'messagesTotal',
                'commandsTotal',
                'servers',
                'voiceConnections',
                'websocketPing',
                'warnings',
                'errors',
                'botRateLimits',
                'userRateLimits'
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

        bot.stats.influx = new Influx.InfluxDB({
            host: config.get("InfluxDB.host"),
            database: config.get("InfluxDB.database"),
            username: config.get("InfluxDB.username"),
            password: config.get("InfluxDB.password"),
            schema: buildSchema()
        });

        let lastMessageCount = {};
        let messageCount = {};

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

        setInterval(async function(){
            let points = [];
            const keys = Object.keys(bot.stats);
            for(let i = 0; i < keys.length; i++){
                points.push(
                    {
                        measurement: keys[i],
                        tags: {"shard": bot.client.shard.id},
                        fields: {[keys[i].startsWith("commands") ? "commands" : keys[i].startsWith("messages") ? "messages" : "value"]: bot.stats[keys[i]]}
                    });
            }
            if(os.hostname() === "Jupiter") {
                await bot.stats.influx.writePoints([
                    {
                        measurement: "commandsPerMinute",
                        tags: {"shard": bot.client.shard.id},
                        fields: {commands: bot.stats.commandsPerMinute}
                    },
                    {
                        measurement: "messagesPerMinute",
                        tags: {"shard": bot.client.shard.id},
                        fields: {messages: bot.stats.messagesPerMinute}
                    },
                    {
                        measurement: "commandsTotal",
                        tags: {"shard": bot.client.shard.id},
                        fields: {commands: bot.stats.commandsTotal}
                    },
                    {
                        measurement: "messagesTotal",
                        tags: {"shard": bot.client.shard.id},
                        fields: {messages: bot.stats.messagesTotal}
                    },
                    {
                        measurement: "serversTotal",
                        tags: {"shard": bot.client.shard.id},
                        fields: {servers: bot.client.guilds.size}
                    }
                ]);
            }

            if(bot.client.shard){
                bot.client.shard.send({
                    type: "heartbeat",
                    payload: {
                        messagesPerMinute: bot.stats.messagesPerMinute,
                        shard: bot.client.shard.id
                    }
                });
            }

            bot.stats.messagesPerMinute = 0;
            bot.stats.commandsPerMinute = 0;




        }, 60000); //1 minute
    }
};