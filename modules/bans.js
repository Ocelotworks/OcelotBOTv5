module.exports = {
    name: "Bans",
    init: function(bot){
        bot.rateLimits = {};
        bot.lastRatelimitRefresh = new Date();
        bot.banCache = {
            user:   [],
            channel:[],
            server: [],
            update: async function updateBanCache(){
                bot.logger.log("Updating Ban Cache");
                bot.banCache.user = [];
                bot.banCache.channel = [];
                bot.banCache.server = [];
                const bans = await bot.database.getBans();

                for(let i = 0; i < bans.length; i++){
                    const ban = bans[i];
                    bot.banCache[ban.type].push(ban.id);
                }
            }
        };

        bot.banCache.update();
        process.on("message", function updateBans(msg){
            if(msg.type === "updateBans")
                bot.banCache.update();
        });

        setInterval(function(){
            bot.rateLimits = {};
            bot.lastRatelimitRefresh = new Date();
        }, 60000);

        bot.checkBan = function checkBan(message){
            if(message.guild && bot.banCache.server.indexOf(message.guild.id) > -1)return true;
            if(message.channel && bot.banCache.channel.indexOf(message.channel.id) > -1)return true;
            return bot.banCache.user.indexOf(message.author.id) > -1;
        };

        function updateRateLimit(command, message){
            const amt = bot.commandUsages[command].rateLimit || 10;
            if(bot.rateLimits[message.author.id])
                bot.rateLimits[message.author.id] += amt;
            else
                bot.rateLimits[message.author.id] = amt;
            bot.logger.info(`${message.author.id} at ${bot.rateLimits[message.author.id]}/${message.getSetting("rateLimit")}`);
        }

        bot.bus.on("commandPerformed", updateRateLimit);

        let rateLimitLimits = [];

        setInterval(function(){
            rateLimitLimits = [];
        }, 240000);

        bot.bus.on("commandRatelimited", function rateLimited(command, message){
            if(rateLimitLimits.indexOf(message.guild.id) > -1){
                let currentRatelimit = message.getSetting("rateLimit");
                let newRatelimit = currentRatelimit <= 10 ? 10 : currentRatelimit-10;
                bot.logger.log(`Lowering rateLimit for ${message.guild.name} (${message.guild.id}) from ${currentRatelimit} to ${newRatelimit}`);
                if(bot.config.cache[message.guild.id])
                    bot.config.cache[message.guild.id].rateLimit = newRatelimit;
                else
                    bot.config.cache[message.guild.id] = {rateLimit: newRatelimit};
            }else{
                rateLimitLimits.push(message.guild.id);
            }
            updateRateLimit(command, message);
        });

        bot.isRateLimited = function isRateLimited(user, guild){
            return !(!bot.rateLimits[user] || bot.rateLimits[user] <= bot.config.get(guild, "rateLimit"));
        }
    }
};