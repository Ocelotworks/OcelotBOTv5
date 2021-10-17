const Embeds = require("../../util/Embeds");
module.exports = {
    name: "Earn Points",
    usage: "earn",
    commands: ["earn", "get", "daily"],
    run: async function (context, bot) {
        const embed = await module.exports.createEmbed(context, bot);

        let response = await context.send({embeds: [embed]});

        let listenerTimeout;
        let voteListener = async (message)=>{
            let {user} = message.payload;
            if(user !== context.user.id)return;
            bot.logger.log("!points earn vote listener for "+context.user.id)
            clearTimeout(listenerTimeout)
            setTimeout(removeListener, 60000);
            context.edit({embeds: [await module.exports.createEmbed(context, bot)]}, response);
        }
        let removeListener = ()=>{
            bot.logger.log(`Removing vote listener for ${context.user.id}`);
            bot.bus.removeListener("vote", voteListener);
        };

        bot.bus.on("registerVote", voteListener);
        listenerTimeout = setTimeout(removeListener, 60000)
    },
    async createEmbed(context, bot){
        let embed = new Embeds.PointsEmbed(context, bot);
        await embed.init();
        embed.setTitleLang("POINTS_EARN_TITLE")
        const now = new Date();
        embed.setDescriptionLang("POINTS_EARN_DESC");

        const voteSources = (await bot.database.getBotlistsWithVoteRewards(bot.client.user.id)).chunk(5);
        for(let c = 0; c < voteSources.length; c++){
            let voteRewards = "";
            for (let i = 0; i < voteSources[c].length; i++) {
                const voteSource = voteSources[c][i];
                const lastVote = await bot.database.getLastVoteBySource(context.user.id, voteSource.id);
                const streak = await bot.database.getStreak(context.user.id, voteSource.id);
                let line = context.getLang("POINTS_EARN_BOTLIST", voteSource);
                if(streak > 1)line = context.getLang("POINTS_EARN_STREAK", {streak, line});
                if (lastVote && now - lastVote < (voteSource.voteTimer * 3600000)) { // Vote timer is stored in hours, we want milliseconds
                    line = context.getLang("POINTS_EARN_BOTLIST_COOLDOWN", {line, timeout: ((voteSource.voteTimer * 3600000) - (now - lastVote)) / 1000})
                }else{
                    line = context.getLang("POINTS_EARN_BOTLIST_READY", {line})
                }
                if(voteSource.voteTimer === 0)line += context.getLang("POINTS_EARN_BOTLIST_NO_COOLDOWN");
                voteRewards += line + "\n";
            }
            embed.addField(c === 0 ? context.getLang("POINTS_EARN_BOTLIST_TITLE") : "‍", voteRewards.substring(0, 1024));
        }
        let games = "";
        games += context.getLang("POINTS_EARN_GAMES_GUESS")+"\n"
        games += context.getLang("POINTS_EARN_GAMES_TRIVIA")+"\n"
        games += context.getLang("POINTS_EARN_GAMES_REFERRAL")+"\n"
        embed.addField(context.getLang("POINTS_EARN_GAMES_TITLE"), games);

        let challenges = await bot.database.getPointsChallenges();
        let challengeProgress = (await bot.database.getInProgressChallenges(context.user.id, challenges.map(c=>c.id))).reduce((acc,c)=>{acc[c.challenge] = c; return acc}, {});
        if(challenges.length > 0) {
            let challengeOutput = "";
            for(let i = 0; i < challenges.length; i++){
                const challenge = challenges[i];
                let line = context.getLang("POINTS_EARN_WEEKLY", challenge);
                if(challengeProgress[challenge.id]?.complete) {
                    line = context.getLang("POINTS_EARN_WEEKLY_COMPLETED", {line});
                }else if(challengeProgress[challenge.id]){
                    line = context.getLang("POINTS_EARN_WEEKLY_PROGRESS", {line, progress: challengeProgress[challenge.id].progress, challenge});
                }else if(challenge.end-now < 1.44e+7) { // 4 hours
                    line = context.getLang("POINTS_EARN_WEEKLY_ENDING", {line, timeout: (challenge.end-now)/1000});
                }else{
                    line = context.getLang("POINTS_EARN_WEEKLY_READY", {line});
                }
                challengeOutput += line+"\n";
            }
            embed.addField(context.getLang(challenges.length > 1 ? "POINTS_EARN_WEEKLY_CHALLENGES" : "POINTS_EARN_WEEKLY_CHALLENGE"), challengeOutput)
        }

        embed.setColor("#03F783");
        embed.setAuthor(context.user.username, context.user.avatarURL());
        return embed;
    }
};