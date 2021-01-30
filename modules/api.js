const express = require('express');
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

        bot.api.listen(8006, function listen(){
            bot.logger.log("Listening on port 8006");
        });
    }
}