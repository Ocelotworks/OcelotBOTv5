/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 25/01/2019
 * ╚════ ║   (ocelotbotv5) fortnite
 *  ════╝
 */

const config = require('config');
const request = require('request');
const Discord = require('discord.js');

const platforms = {
    pc: "pc",
    computer: "pc",
    windows: "pc",
    mac: "pc",
    linux: "pc",
    xb: "xbl",
    xbl: "xbl",
    xbox: "xbl",
    xbox360: "xbl",
    xboxone: "xbl",
    xbox1: "xbl",
    xbone: "xbl",
    psn: "psn",
    ps: "psn",
    ps4: "psn",
    ps3: "psn",
    playstation: "psn",
    playstation4: "psn",
    playstation3: "psn"
};

const game = "Fortnite";
const url = "https://api.fortnitetracker.com/v1/profile/";

module.exports = {
    name: game+" Stats",
    usage: game.toLowerCase()+" [platform] <player>",
    commands: [game.toLowerCase()],
    categories: ["stats"],
    run: function run(message, args, bot) {
        if(!args[1])
            return message.channel.send(`:bangbang: Invalid usage. You must enter a ${game} username. For example: ${args[0]} mr. Pink 1880`);

        if(message.mentions.users.size > 0)
            return message.channel.send(`:bangbang: You must enter the player's ${game} username, not their Discord username.`);

        const platform = platforms[args[1].toLowerCase()] || "pc";
        const username = message.cleanContent.substring(message.cleanContent.indexOf(args[platforms[args[1].toLowerCase()] ? 2 : 1]))

        message.channel.startTyping();

        request({
            headers: {
                "TRN-Api-Key": config.get(`Commands.${module.exports.commands[0]}.key`),
                "Content-Type": "application/json"
            },
            url: url+`${platform}/${encodeURIComponent(username)}`,
            json: true
        },function(err, resp, body){
            message.channel.stopTyping(true);
            if(err)
                return message.replyLang("GENERIC_ERROR");
            if(body.error) {
                let output = body.error;
                if(platform === "pc")
                    output += `\nIf you're looking for an xbox or playstation player, try entering the platform. For example for xbox:, ${args[0]} xbl ${username}`;
                return message.channel.send(output);
            }


            let embed = new Discord.MessageEmbed();
            embed.setAuthor(`Fortnite Statistics for ${body.epicUserHandle} on ${body.platformNameLong}`, "https://i.imgur.com/sWzW8fh.png");
            embed.setColor("#7C53B4");
            //const lastMatch = body.recentMatches[0];
            //embed.setDescription(`Last match:\n${lastMatch.kills} kills, ${lastMatch.matches} matches.`);
            const stats = body.lifeTimeStats;
            if(!stats){
                message.channel.send(":warning: No stats found for that user.");
            }else {
                for (let i = 0; i < stats.length; i++) {
                    const stat = stats[i];
                    embed.addField(stat.key, stat.value, true);
                }
                message.channel.send("", embed);
            }
        });

    }
};