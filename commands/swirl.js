/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) swirl
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Swirl Image",
    usage: "swirl [url]",
    rateLimit: 10,
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["swirl"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", module.exports.image);

        console.log(url);


        const fileName = `temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .autoOrient()
                .swirl(message.getSetting("swirl.amount"))
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "lower.png");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.channel.send("Upload error: "+e);
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};