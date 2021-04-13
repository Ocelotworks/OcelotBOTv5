/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/02/2019
 * ╚════ ║   (ocelotbotv5) apex
 *  ════╝
 */
const config = require('config');
const request = require('request');
const Discord = require('discord.js');

const platforms = {
    pc: 5,
    computer: 5,
    windows: 5,
    mac: 5,
    linux: 5,
    steam: 5,
    origin: 5,
    xb: 1,
    xbl: 1,
    xbox: 1,
    xbox360: 1,
    xboxone: 1,
    xbox1: 1,
    xbone: 1,
    psn: 2,
    ps: 2,
    ps4: 2,
    ps3: 2,
    playstation: 2,
    playstation4: 2,
    playstation3: 2
};

const game = "Apex";
const url = "https://public-api.tracker.gg/apex/v1/standard/profile/";

module.exports = {
    name: game + " Stats",
    usage: game.toLowerCase() + " [platform] <player>",
    detailedHelp: "Apex Legends Stats",
    usageExample: "apex pc unacceptableuse",
    commands: [game.toLowerCase()],
    categories: ["stats"],
    run: function run(message, args, bot) {
        if (!args[1])
            return message.channel.send(`:bangbang: Invalid usage. You must enter a ${game} username. For example: ${args[0]} mr. Pink 1880`);

        if (message.mentions.users.size > 0)
            return message.channel.send(`:bangbang: You must enter the player's ${game} username, not their Discord username.`);

        const platform = platforms[args[1].toLowerCase()] || 5;
        const username = message.cleanContent.substring(message.cleanContent.indexOf(args[platforms[args[1].toLowerCase()] ? 2 : 1]));

        message.channel.startTyping();

        request({
            headers: {
                "TRN-Api-Key": config.get(`API.apex.key`),
                "Content-Type": "application/json"
            },
            url: url + `${platform}/${encodeURIComponent(username)}`,
            json: true
        }, function (err, resp, body) {
            //console.log(JSON.stringify(body));
            message.channel.stopTyping(true);
            if (err)
                return message.replyLang("GENERIC_ERROR");
            if (body.errors) {
                console.log(body.errors);
                return message.channel.send(`${body.errors[0].message}\nIf you're looking for an xbox or playstation player, try entering the platform. For example for xbox:, ${args[0]} xbl ${username}`);
            }
            if (!body.data || !body.data.metadata)
                return message.channel.send(":warning: No stats found for that user.");

            let embed = new Discord.MessageEmbed();

            embed.setAuthor(`Apex Statistics for ${body.data.metadata.platformUserHandle}`, "https://i.imgur.com/GdYZo08.png");
            embed.setColor("#CD3333");
            if (body.data.children && body.data.children[0].metadata) {
                embed.setDescription(body.data.children[0].metadata.legend_name);
                embed.setThumbnail(body.data.children[0].metadata.icon);
            }
            //const lastMatch = body.recentMatches[0];
            //embed.setDescription(`Last match:\n${lastMatch.kills} kills, ${lastMatch.matches} matches.`);
            const stats = body.data.stats;
            if (!stats) {
                message.channel.send(":warning: No stats found for that user.");
            } else {
                for (let i = 0; i < stats.length; i++) {
                    const stat = stats[i];
                    embed.addField(stat.metadata.key, stat.value, true);
                }
                message.channel.send("", embed);
            }
        });

    }
};