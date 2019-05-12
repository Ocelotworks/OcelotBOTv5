const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "We live in a society meme",
    usage: "society [url]",
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    rateLimit: 10,
    commands: ["society", "weliveinasociety", "wlias"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.channel.send(`:bangbang: No image found. ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}${module.exports.usage}`);
            return;
        }
        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        var req = request(url);


        req.on("error", function(err){
            message.channel.send(":bangbang: Error getting image: "+err.message);
        });


        req.on("end", ()=>{
            gm(fileName)
                .resize(660)
                .append("static/society.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "society.png");
                    message.channel.send("", attachment);
                    fs.unlinkSync(fileName);
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};