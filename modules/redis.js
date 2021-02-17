const redis = require("redis");
const config = require('config');
module.exports = {
    name: "Redis",
    init: async function (bot) {
        bot.redis= {};

        bot.redis.client = redis.createClient({
            url: config.get("Redis.host"),
            retry_strategy: (options)=>{
                const reconnect = Math.min(options.attempt * 100, 3000);
                bot.logger.log(`Redis reconnecting in ${reconnect}ms`)
                // reconnect after
                return reconnect;
            }
        });

        bot.redis.client.on("ready", ()=>{
            bot.logger.log("Redis ready");
        });


        bot.redis.cache = async function(key, func, ttl = 3600){
            return new Promise((fulfill)=>{
                bot.redis.client.get(key, async (err, data)=>{
                    try {
                        if (err || !data) {
                            if (err)
                                bot.logger.warn("redis error: " + err);
                            let freshData = await func();
                            fulfill(freshData);
                            bot.stats.cacheMisses++;
                            bot.redis.client.set(key, JSON.stringify(freshData), "EX", ttl);
                        } else {
                            bot.logger.log("Using cached copy for "+key);
                            fulfill(JSON.parse(data))
                            bot.stats.cacheHits++;
                        }
                    }catch(e){
                        console.error(e);
                        fulfill(await func());
                    }
                })
            })
        }
    }
}