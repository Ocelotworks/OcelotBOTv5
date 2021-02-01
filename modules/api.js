const express = require('express');
const os = require("os");
module.exports = {
    name: "HTTP API",
    init: async function (bot) {
        bot.api = express();

        bot.api.get("/", (req, res)=>{
            res.json({
                shard: bot.util.shard,
                totalShards: process.env.SHARD_COUNT,
            });
        });


        bot.api.get("/metrics", (req, res)=>{
            let output = "";
            const labels = `{shard="${bot.util.shard}",hostname="${os.hostname()}"}`
            for(let key in bot.stats){
                if(bot.stats.hasOwnProperty(key)){
                    output += `# TYPE ${key} counter\n`
                    output += `${key}${labels} ${bot.stats[key]}\n`
                }
            }
            output += "# TYPE wsPing counter\n"
            output += `wsPing${labels} ${bot.client.ws.shards.first().ping}\n`;
            output += "# TYPE wsStatus counter\n"
            output += `wsStatus${labels} ${bot.client.ws.shards.first().status}\n`
            res.header('Content-Type', 'text/plain')
            res.send(output);
        })

        bot.api.listen(8006, function listen(){
            bot.logger.log("Listening on port 8006");
        });
    }
}