const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Wave Image",
    usage: "wave [url]",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["wave", "wavey", "waves"],
    categories: ["image", "fun"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.channel.send(":bangbang: No image found. !"+module.exports.usage);
            return;
        }

        const fileName = `temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .wave(10,50)
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "wave.png");
                    message.channel.send("", attachment).catch(function(e){
                        console.log(e);
                        message.channel.send("Upload error: "+e);
                    });
                    fs.unlink(fileName, function(){});
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};