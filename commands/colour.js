/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/11/2019
 * ╚════ ║   (ocelotbotv5) colour
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
const blacks = ["black", "#000000", "rgb(0,0,0)", "rgba(0,0,0)"]
module.exports = {
    name: "Colour Code",
    usage: "colour <code>",
    detailedHelp: "Accepts HTML Colour codes e.g #FF0000",
    usageExample: "colour #FF0000",
    categories: ["tools"],
    rateLimit: 40,
    commands: ["colour", "color"],
    run: function run(message, args, bot) {
        if (!args[1]) {
            return message.replyLang("COLOUR_USAGE", {arg: args[0]});
        } else {
            const size = parseInt(message.getSetting("colour.size"));
            const cnv = canvas.createCanvas(size, size);
            const ctx = cnv.getContext("2d");
            let input = message.cleanContent.substring(args[0].length + 1);
            ctx.fillStyle = input;

            if (ctx.fillStyle === "#000000" && !blacks.includes(input.replace(/ /g, "")))
                return message.replyLang("COLOUR_INVALID");

            ctx.fillRect(0, 0, cnv.width, cnv.height);

            message.channel.send("", new Discord.MessageAttachment(cnv.toBuffer("image/png"), "colour.png"));
        }
    },
};