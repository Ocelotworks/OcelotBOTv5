const Discord = require('discord.js');
module.exports = {
    name: "Earn Points",
    usage: "earn",
    commands: ["earn", "get", "daily"],
    run: async function (message, args, bot) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Earn Points");
        const now = new Date();
        embed.setDescription("Stuck for points? Here are some ways you can earn:");

        const voteSources = (await bot.database.getBotlistsWithVoteRewards()).chunk(5);
        for(let c = 0; c < voteSources.length; c++){
            let voteRewards = "";
            for (let i = 0; i < voteSources[c].length; i++) {
                const voteSource = voteSources[c][i];
                const lastVote = await bot.database.getLastVoteBySource(message.author.id, voteSource.id);
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
        games += `<:points:817100139603820614> **Earn 10 winning a ${message.getSetting("prefix")}guess game (+15 for a new record)**\n`
        games += `<:points:817100139603820614> **Earn up to 5 winning a ${message.getSetting("prefix")}trivia game**\n`
        games += `<:points:817100139603820614> **Earn 100 for referring a server with your ${message.getSetting("prefix")}invite code**\n`
        embed.addField("Games", games);

        let challenges = await bot.database.getPointsChallenges();
        let completedChallenges = (await bot.database.getCompletedChallenges(message.author.id, challenges.map(c=>c.id))).reduce((acc,c)=>{acc[c.challenge] = c; return acc}, {});
        if(challenges.length > 0) {
            let challengeOutput = "";
            for(let i = 0; i < challenges.length; i++){
                const challenge = challenges[i];
                let line = `${challenge.reward_value} - ${challenge.desc.formatUnicorn({prefix: message.getSetting("prefix"), ...challenge})}`
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
        embed.setAuthor(message.author.username, message.author.avatarURL());
        embed.setFooter((await bot.database.getPoints(message.author.id)).toLocaleString(), "https://cdn.discordapp.com/emojis/817100139603820614.png?v=1");
        message.channel.send(embed)
    }
};