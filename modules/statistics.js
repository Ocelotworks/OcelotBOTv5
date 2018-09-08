const Influx = require("influx");
const config = require('config');
module.exports = {
    name: "Statistics Aggregator",
    init: async function(bot){
        bot.stats = {
            messagesPerMinute: 0,
            messagesTotal: 0,
            commandsPerMinute: 0,
            commandsTotal: 0
        };

        bot.stats.influx = new Influx.InfluxDB({
            host: config.get("InfluxDB.host"),
            database: config.get("InfluxDB.database"),
            username: config.get("InfluxDB.username"),
            password: config.get("InfluxDB.password"),
            schema: [
                {
                    measurement: 'messagesPerMinute',
                    fields: {
                        messages: Influx.FieldType.INTEGER
                    },
                    tags: ["shard"]
                },
                {
                    measurement: 'commandsPerMinute',
                    fields: {
                        commands: Influx.FieldType.INTEGER
                    },
                    tags: ["shard"]
                },
                {
                    measurement: 'messagesTotal',
                    fields: {
                        messages: Influx.FieldType.INTEGER
                    },
                    tags: ["shard"]
                },
                {
                    measurement: 'commandsTotal',
                    fields: {
                        commands: Influx.FieldType.INTEGER
                    },
                    tags: ["shard"]
                }
            ]
        });

        bot.client.on("message", function(){
            bot.stats.messagesPerMinute++;
            bot.stats.messagesTotal++;
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
                }
            ]);
            bot.stats.messagesPerMinute = 0;
            bot.stats.commandsPerMinute = 0;
        }, 60000); //1 minute
    }
};