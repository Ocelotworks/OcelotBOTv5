/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) deepfry
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Deepfry",
    usage: "deepfry [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["deepfry"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", module.exports);

        console.log(url);

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .modulate(message.getSetting("deepfry.brightness"), message.getSetting("deepfry.saturation"))
                .noise(message.getSetting("deepfry.noise"))
                .sharpen(message.getSetting("deepfry.sharpness"))
                .quality(message.getSetting("deepfry.quality"))
                .toBuffer("JPEG", function(err, buffer){
                    if(err)
                        return message.replyLang("GENERIC_ERROR");
                    let attachment = new Discord.Attachment(buffer, "jpeg.jpg");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.replyLang("GENERIC_UPLOAD_ERROR", {error: e});
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};