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
                return reconnect;
            },
            enable_offline_queue: false,
            connect_timeout: 2147483647, // Fuck the man
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
                        reject(e);
                    }
                })
            })
        }

        bot.redis.get = async function(key){
            return new Promise((fulfill, reject)=>{
               bot.redis.client.get(key, (err, data)=>{
                   if(err)return reject(err);
                   fulfill(data);
               })
            });
        }

        bot.redis.set = function(key, value, ttl = 3600){
            return bot.redis.client.set(key, value, "EX", ttl);
        }

        bot.redis.getJson = async function(key){
            return bot.redis.get(key).then((r)=>JSON.parse(r));
        }

        bot.redis.setJson = function(key, value, ttl = 3600){
            return bot.redis.set(key, JSON.stringify(value), ttl);
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