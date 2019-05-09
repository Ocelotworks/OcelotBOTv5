/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/01/2019
 * ╚════ ║   (ocelotbotv5) rewind
 *  ════╝
 */



const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "It's Rewind Time",
    usage: "rewind [url]",
    rateLimit: 10,
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rewind", "ninja", "rewindtime"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
            return;
        }
        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .resize(500, 274)
                .composite("static/rewind.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "rewind.png");
                    message.channel.send("", attachment);
                    fs.unlink(fileName, function unlink(err){
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};