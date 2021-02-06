const express = require('express');
const os = require("os");
module.exports = {
    name: "HTTP API",
    init: async function (bot) {


        function writeOpenMetric(name, value){
            return `# TYPE ${name} counter\n${name}{shard="${bot.util.shard}"} ${value}\n`
        }


        bot.api = express();

        bot.api.use((req, res, next)=>{
            res.setHeader("X-Shard", bot.util.shard);
            next();
        });

        bot.api.get("/", (req, res)=>{
            res.json({
                shard: bot.util.shard,
                totalShards: process.env.SHARD_COUNT,
                drain: bot.drain,
            });
        });

        bot.api.get("/commands", (req, res)=>{
            res.json(bot.commandUsages);
        })


        bot.api.get("/metrics", (req, res)=>{
            let output = "";
            for(let key in bot.stats){
                if(bot.stats.hasOwnProperty(key)){
                    output += writeOpenMetric(key, bot.stats[key]);
                }
            }

            output += writeOpenMetric("wsPing", bot.client.ws.shards.first().ping);
            output += writeOpenMetric("wsStatus", bot.client.ws.shards.first().status);
            output += writeOpenMetric("guilds", bot.client.guilds.cache.size);
            output += writeOpenMetric("channels", bot.client.channels.cache.size);
            output += writeOpenMetric("users", bot.client.users.cache.size);
            output += writeOpenMetric("uptime", bot.client.uptime);
            output += writeOpenMetric("guildsUnavailable", bot.client.guilds.cache.filter((g)=>!g.available).size);
            output += writeOpenMetric("drain", +bot.drain);

            res.header('Content-Type', 'text/plain')
            res.send(output);
        })

        bot.api.listen(process.env.PORT || 8006, function listen(){
            bot.logger.log("Listening on port 8006");
        });
    }
}


