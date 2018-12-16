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
            let result = await bot.database.getServerSettings(server);
            for(let i = 0; i < result.length; i++){
                const row = result[i];
                bot.config.cache[server][row.setting] = row.value;
            }
        };

        bot.config.loadGlobalCache = function loadGlobalCache(){
            bot.logger.log("Populating global setting cache...");
            bot.database.getGlobalSettings().then(function getGlobalSettings(settings){
                bot.config.cache.global = {};
                for(let i = 0; i < settings.length; i++){
                    const row = settings[i];
                    bot.config.cache.global[row.setting] = row.value;
                }
                bot.logger.log(`Loaded ${Object.keys(bot.config.cache.global).length} global config keys`);
            });
        };

        bot.config.loadServerCache = async function loadServerCache(){
            bot.logger.log("Populating server setting cache...");
            let result = await bot.database.getSettingsForShard(bot.client.guilds.keyArray());
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

        bot.config.loadGlobalCache();
        bot.client.on("ready", bot.config.loadServerCache);

        bot.config.get = function get(server, property){
            if(bot.config.cache[server] && bot.config.cache[server][property])
                return bot.config.cache[server][property];
            if(bot.config.cache.global[property])
                return bot.config.cache.global[property];
            return null;
        };

        let cacheReloads = [];

        process.on("message", function reloadConfig(msg){
            if(msg.type === "reloadConfig" && msg.payload === "global" || bot.client.guilds.has(msg.payload)){
                if(cacheReloads[msg.payload])return;
                cacheReloads[msg.payload] = setTimeout(function(){
                    bot.config.reloadCacheForServer(msg.payload);
                    delete cacheReloads[msg.payload];
                }, 5000);
                bot.logger.log("Broker requested config reload for "+msg.payload);
            }
        })
    }
};