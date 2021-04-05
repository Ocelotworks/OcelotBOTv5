/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (ocelotbotv5) vote
 *  ════╝
 */
module.exports = {
    name: "Vote For OcelotBOT",
    usage: "vote",
    rateLimit: 10,
    categories: ["meta"],
    requiredPermissions: [],
    commands: ["vote"],
    init: function (bot) {
        bot.waitingVoteChannels = [];

        let voteTimeouts = {};

        async function logVote(user, voteServer, channel, source) {
            bot.logger.log(`Vote Source: ${source}`);

            const botList = await bot.database.getBotlist(source);
            if(botList[0] && botList[0].pointsReward) {
                await bot.database.addPoints(user, botList[0].pointsReward, `vote (${source})`);
            }

            let lastVote = await bot.database.getLastVote(user);
            if (lastVote[0])
                lastVote = lastVote[0]['MAX(timestamp)'];
            let difference = new Date() - lastVote;
            if (difference < bot.util.voteTimeout * 2)
                await bot.database.incrementStreak(user, "vote");
            else
                await bot.database.resetStreak(user, "vote");

            await bot.database.addVote(user, voteServer, source);
            bot.logger.log("Logging vote from " + user);
            let count = (await bot.database.getVoteCount(user))[0]['COUNT(*)'];
            bot.badges.updateBadge({id: user}, 'votes', count, channel);
        }

        bot.bus.on("registerVote", async (message) => {
            let user = message.payload.user;
            let source = message.payload.source;
            let voteServer = null;
            let channel = null;

            if(bot.client.guilds.cache.has("322032568558026753")) {
                try {
                    const userObj = await bot.client.users.fetch(user);
                    (await bot.client.channels.fetch("756854640204709899")).send(`:heart: **${userObj.tag}** just voted at ${await bot.database.getBotlistUrl(source)}`)
                } catch (e) {
                    // fart
                    //console.log(e);
                }
            }

            for (let i = 0; i < bot.waitingVoteChannels.length; i++) {
                if (bot.waitingVoteChannels[i].members && bot.waitingVoteChannels[i].members.has(user)) {
                    channel = bot.waitingVoteChannels[i];
                    bot.logger.log("Matched waiting vote channel for " + user);
                    const streak = await bot.database.getStreak(user, "vote");
                    if (streak > 1)
                        channel.sendLang("VOTE_MESSAGE_STREAK", {user, streak});
                    else
                        channel.sendLang("VOTE_MESSAGE", {user});
                    bot.waitingVoteChannels.splice(i, 1);
                    voteServer = channel.guild.id;
                    break;
                }
            }
            if (voteServer || bot.util.shard == 0) {
                if (bot.util.shard == 0) {
                    voteTimeouts[user] = setTimeout(logVote, 5000, user, voteServer, channel, source);
                } else {
                    await logVote(user, voteServer, channel, source);
                    await bot.rabbit.event({type: "clearVoteTimeout", payload: user});
                }
            }

        })

        bot.bus.on("clearVoteTimeout", async (message) => {
            clearTimeout(voteTimeouts[message.payload]);
        });
    },
    run: async function (message, args, bot) {
        if (args[1]) return;
        let lastVote = await bot.database.getLastVote(message.author.id);
        if (lastVote[0])
            lastVote = lastVote[0]['MAX(timestamp)'];
        let difference = new Date() - lastVote;

        if (difference < bot.util.voteTimeout) {
            message.replyLang("VOTE_TIMEOUT", {time: bot.util.prettySeconds((bot.util.voteTimeout - difference) / 1000, message.guild && message.guild.id, message.author.id)});
        } else {
            message.replyLang("VOTE");
        }
        bot.waitingVoteChannels.unshift(message.channel);
    }
};