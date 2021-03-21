const redis = require("redis");
const config = require('config');
module.exports = {
    name: "Redis",
    init: async function (bot) {
        bot.redis = {};

        bot.redis.client = redis.createClient({
            url: config.get("Redis.host"),
            retry_strategy: function retry(options) {
                const reconnect = Math.max(options.attempt * 100, 3000);
                bot.logger.log(`Redis reconnecting in ${reconnect}ms`)
                // reconnect after
                return reconnect;
            },
            enable_offline_queue: false,
        });

        bot.redis.client.on("ready", () => {
            bot.logger.log("Redis ready");
        });


        bot.redis.cache = async function (key, func, ttl = 3600) {
            return new Promise((fulfill, reject) => {
                bot.redis.client.get(key, async (err, data) => {
                    try {
                        if (err || !data) {
                            let freshData = await func();
                            fulfill(freshData);
                            if (err)
                                bot.logger.warn("redis error: " + err);
                            else {
                                try {
                                    bot.redis.client.set(key, JSON.stringify(freshData), "EX", ttl);
                                }catch(e){
                                    bot.logger.error(e)
                                    bot.raven.captureException(e);
                                }
                            }
                            bot.stats.cacheMisses++;
                        } else {
                            bot.logger.log("Using cached copy for " + key);
                            fulfill(JSON.parse(data))
                            bot.stats.cacheHits++;
                        }
                    } catch (e) {
                        bot.logger.error(e);
                        bot.raven.captureException(e);
                        reject(e);
                    }
                })
            })
        }

        bot.redis.clear = async function(key){
            return new Promise((fulfill)=>{
                bot.redis.client.del(key, (err)=>{
                    bot.logger.log({type: "deleteKey", key})
                    if(err)bot.logger.log(err);
                    fulfill();
                })
            })
        }
    }
}