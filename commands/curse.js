/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/04/2019
 * ╚════ ║   (ocelotbotv5) curse
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Curse Image",
    usage: "curse [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["curse", "cursed"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", module.exports);

        console.log(url);

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .modulate(50)
                .gamma(1,0.8,0.8)
                //.edge(50)
                .quality(50)
                .toBuffer("JPEG", function(err, buffer){
                    if(err)
                        return message.replyLang("GENERIC_ERROR");
                    let attachment = new Discord.Attachment(buffer, "jpeg.jpg");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.channel.send("Upload error: "+e);
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};