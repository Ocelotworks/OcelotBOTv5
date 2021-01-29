const Sentry = require('@sentry/node');
module.exports = {
    name: "Configuration Manager",
    init: function(bot){
        bot.config = {};

        bot.config.cache = {};

        bot.config.reloadCache = async function reloadCache(){
            bot.logger.log("Reloading Settings Cache");
            bot.config.cache = {};
            bot.config.loadGlobalCache();
            await bot.config.loadServerCache();
        };

        bot.config.reloadCacheForServer = async function reloadCacheForServer(server){
            bot.config.cache[server] = {};
            let result = await bot.database.getServerSettings(server, bot.client.user.id);
            for(let i = 0; i < result.length; i++){
                const row = result[i];
                bot.config.cache[server][row.setting] = row.value;
            }
        };

        bot.config.loadGlobalCache = function loadGlobalCache(){
            bot.logger.log("Populating global setting cache...");
            bot.database.getGlobalSettings(bot.client.user.id).then(function getGlobalSettings(settings){
                bot.config.cache.global = {};
                for(let i = 0; i < settings.length; i++){
                    const row = settings[i];
                    bot.config.cache.global[row.setting] = row.value;
                }
                bot.logger.log(`Loaded ${Object.keys(bot.config.cache.global).length} global config keys`);
            }).catch(function(err){
                Sentry.captureException(err);
                bot.config.cache.global = {};
            });
        };

        bot.config.loadServerCache = async function loadServerCache(){
            bot.logger.log("Populating server setting cache...");
            let result = await bot.database.getSettingsForShard(bot.client.guilds.cache.keyArray(), bot.client.user.id);
            for(let i = 0; i < result.length; i++){
                const row = result[i];
                if(bot.config.cache[row.server])
                    bot.config.cache[row.server][row.setting] = row.value;
                else
                    bot.config.cache[row.server] = {
                        [row.setting]: row.value
                    }
            }
            bot.logger.log(`Loading ${result.length} server config keys`);
        };

        bot.config.loadUserCache = async function loadUserCache(){
            bot.logger.log("Populating user setting cache...");
            let result = await bot.database.getUserSettingsForShard(bot.client.users.cache.keyArray());
            for(let i = 0; i < result.length; i++){
                const row = result[i];
                if(bot.config.cache[row.user])
                    bot.config.cache[row.user][row.setting] = row.value;
                else
                    bot.config.cache[row.user] = {
                        [row.setting]: row.value
                    }
            }
            bot.logger.log(`Loading ${result.length} user config keys`);
        };

        bot.client.on("ready", async function(){
            bot.config.loadGlobalCache();
            await bot.config.loadServerCache();
            await bot.config.loadUserCache();
        });

        bot.config.get = function get(server, property, user){
            if(user && bot.config.cache[user] && bot.config.cache[user][property])
                return bot.config.cache[user][property];
            if(bot.config.cache[server] && bot.config.cache[server][property])
                return bot.config.cache[server][property];
            if(bot.config.cache.global && bot.config.cache.global[property])
                return bot.config.cache.global[property];
            return null;
        };

        bot.config.getBool = function getBool(server, property, user){
            let result = bot.config.get(server, property, user);
            return result === "true" || result === "1";
        };

        bot.config.set = async function(server, property, value){
            await bot.database.setSetting(server, property, value, bot.client.user.id);
            await bot.config.reloadCacheForServer(server);
        };

        let cacheReloads = [];

        process.on("message", function reloadConfig(msg){
            if(msg.type === "reloadConfig" && (msg.payload === "global" ||  msg.payload == bot.util.shard || bot.client.guilds.cache.has(msg.payload))){
                if(cacheReloads[msg.payload])return;

                cacheReloads[msg.payload] = setTimeout(function(){
                    if(msg.payload === "global" || msg.payload == bot.util.shard){
                        bot.config.loadGlobalCache();
                    }else{
                        bot.config.reloadCacheForServer(msg.payload);
                    }

                    delete cacheReloads[msg.payload];
                }, 5000);
                bot.logger.log("Broker requested config reload for "+msg.payload);
            }else if(msg.type === "reloadUserConfig"){
                bot.logger.log("Reloading user config");
                bot.config.loadUserCache();
            }
        })
    }
};