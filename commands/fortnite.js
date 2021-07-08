/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 25/01/2019
 * ╚════ ║   (ocelotbotv5) fortnite
 *  ════╝
 */

const config = require('config');
const Discord = require('discord.js');
const {axios} = require('../util/Http');

const game = "Fortnite";
const url = "https://api.fortnitetracker.com/v1/profile/";

module.exports = {
    name: game+" Stats",
    usage: game.toLowerCase()+" [platform?:xbl,psn,pc] :player+",
    commands: [game.toLowerCase()],
    detailedHelp: `Get ${game} stats for a specific user`,
    usageExample: `${game.toLowerCase()} mr. Pink 1880`,
    categories: ["stats"],
    run: async function run(context, bot) {
        const platform = context.options.platform || "pc";
        const username = context.options.player;

        context.defer();

        const result = await axios.get(`${url}${platform}/${encodeURIComponent(username)}`, {
            headers: {
                "TRN-Api-Key": config.get(`API.fortnite.key`),
                "Content-Type": "application/json"
            },
        })

        if(result.data.error) {
            let output = result.data.error;
            if(platform === "pc")
                output += `\nIf you're looking for an xbox or playstation player, try entering the platform. For example for xbox: **${context.command} xbl ${username}**`;
            return context.send({content: output, ephemeral: true});
        }

        let embed = new Discord.MessageEmbed();
        embed.setAuthor(`Fortnite Statistics for ${result.data.epicUserHandle} on ${result.data.platformNameLong}`, "https://i.imgur.com/sWzW8fh.png");
        embed.setColor("#7C53B4");
        //const lastMatch = body.recentMatches[0];
        //embed.setDescription(`Last match:\n${lastMatch.kills} kills, ${lastMatch.matches} matches.`);
        const stats = result.data.lifeTimeStats;
        if(!stats){
            context.send({content: ":warning: No stats found for that user.", ephemeral: true});
        }else {
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                embed.addField(stat.key, stat.value, true);
            }
            context.send({embeds: [embed]});
        }

    }
};