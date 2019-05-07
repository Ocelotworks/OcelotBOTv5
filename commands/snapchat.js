/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/02/2019
 * ╚════ ║   (ocelotbotv5) snapchat
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
module.exports = {
    name: "Snapchat Text",
    usage: "snapchat [url] [text]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["snapchat", "snap"],
    init: function(){
        canvas.registerFont(__dirname+"/../static/DroidSans.ttf", {family: 'DroidSans'});
    },
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", module.exports.image);

        console.log(url);


        let text;

        if(args[1].startsWith("http") || args[1].startsWith("<"))
            text = message.content.substring(args[0].length+args[1].length+2);
        else
            text = message.content.substring(args[0].length+1);

        const img = await canvas.loadImage(url);


        const cnv = canvas.createCanvas(img.width, img.height);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(img, 0,0);

        const textSize = img.height/24;
        const barHeight = textSize*2;
        const barPosition = img.height-(img.height/3);

        console.log(textSize, barHeight, barPosition);

        ctx.font = textSize+"px DroidSans";
        ctx.fillStyle = "rgba(0,0,0,0.6)";


        ctx.fillRect(0,barPosition-barHeight,img.width, barHeight);
        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        ctx.fillText(text,img.width/2, barPosition-barHeight*0.4);

        message.channel.send("", new Discord.Attachment(cnv.toBuffer("image/png"), "snapchat.png")).catch(function(err){
            message.channel.send("Error: "+err);
        });

    }
};