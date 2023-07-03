/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/02/2019
 * ╚════ ║   (ocelotbotv5) apex
 *  ════╝
 */
const config = require('config');
const request = require('request');
const Discord = require('discord.js');
const Embeds = require("../util/Embeds");
const Sentry = require("@sentry/node");

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
    usage: game.toLowerCase() + " [platform?:xbl,ps,pc] :player+",
    detailedHelp: "Apex Legends Stats",
    usageExample: "apex pc unacceptableuse",
    commands: [game.toLowerCase()],
    categories: ["stats"],
    run: function run(context, bot) {
        const platform = platforms[context.options.platform] || 5;
        const username = context.options.player;

        context.defer();

        request({
            headers: {
                "TRN-Api-Key": config.get(`API.apex.key`),
                "Content-Type": "application/json"
            },
            url: url + `${platform}/${encodeURIComponent(username)}`,
            json: true
        }, function (err, resp, body) {
            //console.log(JSON.stringify(body));
            if (err) {
                Sentry.captureException(err);
                return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
            }
            if (body.errors) {
                console.log(body.errors);
                Sentry.captureMessage(body.errors[0].message);
                return context.sendLang({content: "STATS_ERROR", ephemeral: true}, {message: body.errors[0].message, username});
            }
            if (!body.data || !body.data.metadata)
                return context.sendLang({content: "STATS_NOT_FOUND", ephemeral: true});

            let embed = new Embeds.LangEmbed(context);
            embed.setAuthorLang("APEX_STATS_TITLE", {handle: body.data.metadata.platformUserHandle}, "https://i.imgur.com/GdYZo08.png")
            embed.setColor("#CD3333");
            if (body.data.children?.[0].metadata) {
                embed.setDescription(body.data.children[0].metadata.legend_name);
                embed.setThumbnail(body.data.children[0].metadata.icon);
            }
            //const lastMatch = body.recentMatches[0];
            //embed.setDescription(`Last match:\n${lastMatch.kills} kills, ${lastMatch.matches} matches.`);
            const stats = body.data.stats;
            if (!stats) {
                return context.sendLang({content: "STATS_NO_STATS", ephemeral: true});
            } else {
                for (let i = 0; i < stats.length; i++) {
                    const stat = stats[i];
                    console.log(stat)
                    embed.addField(stat.metadata.key, stat.value.toString(), true);
                }
                context.send({embeds: [embed]});
            }
        });

    }
};