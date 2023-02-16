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
const Util = require("../util/Util");
module.exports = {
    name: "Deepfry",
    usage: "deepfry :image?",
    detailedHelp: "Ruins an image",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["deepfry"],
    slashCategory: "filter",
    run: async function(context, bot){
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request({url, timeout: 10000}).on("end", ()=>{
            let output = gm(fileName)
                .modulate(context.getSetting("deepfry.brightness"), context.getSetting("deepfry.saturation"))
                .noise(context.getSetting("deepfry.noise"))
                .sharpen(context.getSetting("deepfry.sharpness"))
                .quality(context.getSetting("deepfry.quality"))
                .filesize((err, value)=>{
                    if(!err && value && value.endsWith("Mi") && parseInt(value) > 4){
                        console.log("Resizing image");
                        output = output.resize("50%");
                    }
                    console.log(err, value);
                })
            output.toBuffer("JPEG", function(err, buffer){
                if(err)
                    return context.replyLang("GENERIC_ERROR");
                let attachment = new Discord.MessageAttachment(buffer, "jpeg.jpg");
                context.send({files: [attachment]}).catch(function(e){
                    console.log(e);
                    context.replyLang("GENERIC_UPLOAD_ERROR", {error: e});
                });
                fs.unlink(fileName, function(){});
            });
        }).pipe(fs.createWriteStream(fileName));

    }
};