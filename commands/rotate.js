/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) rotate
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Rotate Image",
    usage: "rotate [url] [deg]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rotate", "rot"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", module.exports.image);

        console.log(url);

        let num = 90;
        if(args[1] && !isNaN(args[1]))
            num = args[1];
        else if(args[2] && !isNaN(args[2]))
            num = args[2];

        const fileName = `temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .rotate('black',num)
                .toBuffer("PNG", function(err, buffer){
                    if(err)
                        return message.replyLang("GENERIC_ERROR");
                    let attachment = new Discord.Attachment(buffer, "rotate.png");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.channel.send("Upload error: "+e);
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};