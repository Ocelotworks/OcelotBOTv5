/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) implode
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Implode Image",
    usage: "implode [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["implode"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.channel.send(`:bangbang: No image found. ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}${module.exports.usage}`);
            return;
        }
        console.log(url);


        const fileName = `temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .implode(message.getSetting("implode.amount"))
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "bulge.png");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.channel.send("Upload error: "+e);
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};