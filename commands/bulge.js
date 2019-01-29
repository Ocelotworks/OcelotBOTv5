const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Bulge Image",
    usage: "bulge [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bulge", "explode", "buldge"],
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
                .implode(message.getSetting("bulge.amount"))
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