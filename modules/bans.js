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

        bot.bus.on("commandPerformed", function rateLimit(command, message){
            const amt = bot.commandUsages[command].rateLimit || 10;
            if(bot.rateLimits[message.author.id])
                bot.rateLimits[message.author.id] += amt;
            else
                bot.rateLimits[message.author.id] = amt;
            bot.logger.log(`${message.author.id} at ${bot.rateLimits[message.author.id]}/${bot.config.get(message.guild.name, "rateLimit")}`);
        });

        let rateLimitLimits = [];

        setInterval(function(){
            rateLimitLimits = [];
        }, 240000);

        bot.bus.on("commandRatelimited", function rateLimited(command, message){
            if(rateLimitLimits.indexOf(message.guild.id) > -1){
                let currentRatelimit = bot.config.get(message.guild.id, "rateLimit");
                bot.logger.log(`Lowering rateLimit for ${message.guild.name} (${message.guild.id}) from ${currentRatelimit} to ${currentRatelimit/2}`);
                bot.config.cache[message.guild.id].rateLimit = currentRatelimit/2;
            }
        });

        bot.isRateLimited = function isRateLimited(user, guild){
            return !(!bot.rateLimits[user] || bot.rateLimits[user] < bot.config.get(guild, "rateLimit"));
        }
    }
};