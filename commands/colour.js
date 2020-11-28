/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/11/2019
 * ╚════ ║   (ocelotbotv5) colour
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
module.exports = {
    name: "Colour Code",
    usage: "colour <code>",
    detailedHelp: "Accepts HTML Colour codes e.g #FF0000",
    usageExample: "colour #FF0000",
    categories: ["tools"],
    rateLimit: 40,
    commands: ["colour", "color"],
    run: function run(message, args, bot) {
        if(!args[1]){
            return message.replyLang("GENERIC_TEXT", {command: args[0]})
        }else{
            const size = parseInt(message.getSetting("colour.size"));
            const cnv = canvas.createCanvas(size, size);
            const ctx = cnv.getContext("2d");
            ctx.fillStyle = message.cleanContent.substring(args[0].length+1);

            ctx.fillRect(0,0,cnv.width, cnv.height);

            message.channel.send("", new Discord.MessageAttachment(cnv.toBuffer("image/png"), "colour.png"));
        }
    },
};