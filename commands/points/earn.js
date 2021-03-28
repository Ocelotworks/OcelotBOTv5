const Discord = require('discord.js');
module.exports = {
    name: "Earn Points",
    usage: "earn",
    commands: ["earn", "get", "daily"],
    run: async function (message, args, bot) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Earn Points");
        const now = new Date();
        let output = "Stuck for points? Here are some ways you can earn:\n\n";
        const voteSources = await bot.database.getBotlistsWithVoteRewards();
        for (let i = 0; i < voteSources.length; i++) {
            const voteSource = voteSources[i];
            const lastVote = await bot.database.getLastVoteBySource(message.author.id, voteSource.id);
            let line = `<:points:817100139603820614> Earn ${voteSource.pointsReward} Voting at [${voteSource.name}](${voteSource.botUrl})`;
            if (lastVote && now - lastVote < (voteSource.voteTimer * 3600000)) { // Vote timer is stored in hours, we want milliseconds
                line = `~~${line}~~ [Available in ${bot.util.shortSeconds(((voteSource.voteTimer * 3600000) - (now - lastVote)) / 1000)}]`
            }else{
                line = `**${line}**`;
            }
            output += line + "\n";
        }
        output += `<:points:817100139603820614> **Earn 10 winning a ${message.getSetting("prefix")}guess game (+15 for a new record)**\n`
        output += `<:points:817100139603820614> **Earn up to 5 winning a ${message.getSetting("prefix")}trivia game**\n`
        output += `<:points:817100139603820614> **Earn 100 points for referring a server with your ${message.getSetting("prefix")}invite code**\n`
        embed.setColor("#03F783");
        embed.setAuthor(message.author.username, message.author.avatarURL());
        embed.setDescription(output);
        embed.setFooter((await bot.database.getPoints(message.author.id)).toLocaleString(), "https://cdn.discordapp.com/emojis/817100139603820614.png?v=1");
        message.channel.send(embed)
    }
};