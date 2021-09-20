module.exports = {
    name: "Bans",
    init: function (bot) {
        bot.rateLimits = {};
        bot.lastRatelimitRefresh = new Date();
        bot.banCache = {
            user: [],
            channel: [],
            server: [],
            update: async function updateBanCache() {
                bot.logger.log("Updating Ban Cache");
                bot.banCache.user = [];
                bot.banCache.channel = [];
                bot.banCache.server = [];
                const bans = await bot.database.getBans();

                for (let i = 0; i < bans.length; i++) {
                    const ban = bans[i];
                    bot.banCache[ban.type].push(ban.id);
                }
            }
        };

        bot.banCache.update();
        bot.bus.on("updateBans", (msg) => {
            bot.banCache.update();
        })

        setInterval(function () {
            bot.rateLimits = {};
            bot.lastRatelimitRefresh = new Date();
        }, 60000);

        bot.checkBan = function checkBan(context) {
            if (context.guild && bot.banCache.server.indexOf(context.guild.id) > -1) return true;
            if (context.channel && bot.banCache.channel.indexOf(context.channel.id) > -1) return true;
            return bot.banCache.user.indexOf(context.user.id) > -1;
        };

        function updateRateLimit(command, message) {
            const amt = bot.commandUsages[command].rateLimit || 10;
            if (bot.rateLimits[message.author.id])
                bot.rateLimits[message.author.id] += amt;
            else
                bot.rateLimits[message.author.id] = amt;
            bot.logger.info(`${message.author.id} at ${bot.rateLimits[message.author.id]}/${message.getSetting("rateLimit")}`);
        }

        // TODO: Context ratelimits
       // bot.bus.on("commandPerformed", updateRateLimit);

        let rateLimitLimits = [];

        setInterval(function () {
            rateLimitLimits = [];
        }, 240000);

        bot.addCommandMiddleware((context)=>{
            return !bot.checkBan(context)
        }, "Bans", 102);

        bot.addCommandMiddleware((context)=>{
            if (!bot.isRateLimited(context.user?.id, context.user?.id || "global")) return true;
            bot.bus.emit("commandRatelimited", context);
            bot.logger.warn(`${context.user.username} (${context.user.id}) in ${context.guild?.name || "DM"} (${context.guild?.id || context.channel?.id}) was ratelimited`);
            if (bot.rateLimits[context.user.id] < context.getSetting("rateLimit.threshold")) {
                const now = new Date();
                const timeDifference = now - this.bot.lastRatelimitRefresh;
                let timeLeft = 60000 - timeDifference;
                context.replyLang({
                    content: "COMMAND_RATELIMIT",
                    ephemeral: true
                }, {timeLeft: bot.util.prettySeconds(timeLeft / 1000, context.guild?.id, context.user?.id)});
                this.bot.rateLimits[context.user.id] += context.commandData.rateLimit || 1;
            }
            return false;
        }, "Ratelimit", 101)

        bot.bus.on("commandRatelimited", function rateLimited(command, message) {
            // if(rateLimitLimits.indexOf(message.guild.id) > -1){
            //     // let currentRatelimit = message.getSetting("rateLimit");
            //     // let newRatelimit = currentRatelimit <= 10 ? 10 : currentRatelimit-10;
            //     // bot.logger.log(`Lowering rateLimit for ${message.guild.name} (${message.guild.id}) from ${currentRatelimit} to ${newRatelimit}`);
            //     // if(bot.config.cache[message.guild.id])
            //     //     bot.config.cache[message.guild.id].rateLimit = newRatelimit;
            //     // else
            //     //     bot.config.cache[message.guild.id] = {rateLimit: newRatelimit};
            // }else{
            //     rateLimitLimits.push(message.guild.id);
            // }
            // TODO: Context ratelimits
            //updateRateLimit(command, message);
        });

        bot.isRateLimited = function isRateLimited(user, guild) {
            return !(!bot.rateLimits[user] || bot.rateLimits[user] <= bot.config.get(guild, "rateLimit", user));
        }
    }
};