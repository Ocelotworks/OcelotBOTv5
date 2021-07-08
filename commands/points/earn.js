const Discord = require('discord.js');
const Embeds = require("../../util/Embeds");
module.exports = {
    name: "Earn Points",
    usage: "earn",
    commands: ["earn", "get", "daily"],
    run: async function (context, bot) {
        let embed = new Embeds.PointsEmbed(context, bot);
        await embed.init();
        embed.setTitle("Earn Points");
        const now = new Date();
        embed.setDescription("Stuck for points? Here are some ways you can earn:");

        const voteSources = (await bot.database.getBotlistsWithVoteRewards()).chunk(5);
        for(let c = 0; c < voteSources.length; c++){
            let voteRewards = "";
            for (let i = 0; i < voteSources[c].length; i++) {
                const voteSource = voteSources[c][i];
                const lastVote = await bot.database.getLastVoteBySource(context.user.id, voteSource.id);
                let line = `Earn ${voteSource.pointsReward} Voting at [${voteSource.name}](${voteSource.botUrl})`;
                if (lastVote && now - lastVote < (voteSource.voteTimer * 3600000)) { // Vote timer is stored in hours, we want milliseconds
                    line = `<:points_off:825695949790904330> ~~${line}~~ [Available in ${bot.util.shortSeconds(((voteSource.voteTimer * 3600000) - (now - lastVote)) / 1000)}]`
                }else{
                    line = `<:points:817100139603820614> **${line}**`;
                }
                voteRewards += line + "\n";
            }
            embed.addField(c === 0 ? "Voting" : "‍", voteRewards.substring(0, 1024));
        }
        let games = "";
        games += `<:points:817100139603820614> **Earn 10 winning a ${context.getSetting("prefix")}guess game (+15 for a new record)**\n`
        games += `<:points:817100139603820614> **Earn up to 5 winning a ${context.getSetting("prefix")}trivia game**\n`
        games += `<:points:817100139603820614> **Earn 100 for referring a server with your ${context.getSetting("prefix")}invite code**\n`
        embed.addField("Games", games);

        let challenges = await bot.database.getPointsChallenges();
        let completedChallenges = (await bot.database.getCompletedChallenges(context.user.id, challenges.map(c=>c.id))).reduce((acc,c)=>{acc[c.challenge] = c; return acc}, {});
        if(challenges.length > 0) {
            let challengeOutput = "";
            for(let i = 0; i < challenges.length; i++){
                const challenge = challenges[i];
                let line = `${challenge.reward_value} - ${challenge.desc.formatUnicorn({prefix: context.getSetting("prefix"), ...challenge})}`
                if(completedChallenges[challenge.id]){
                    line = `<:points_off:825695949790904330> ~~${line}~~`
                }else if(challenge.end-now < 1.44e+7) { // 4 hours
                    line = `<a:points_ending:825704034031501322> **${line}** [Ends in ${bot.util.shortSeconds((challenge.end-now)/1000)}]`
                }else{
                    line = `<:points:817100139603820614> **${line}**`
                }
                challengeOutput += line+"\n";
            }
            embed.addField(challenges.length > 1 ? "Weekly Challenges" : "Weekly Challenge", challengeOutput)
        }

        embed.setColor("#03F783");
        embed.setAuthor(context.user.username, context.user.avatarURL());
        context.send({embeds: [embed]})
    }
};