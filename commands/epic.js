const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "This is epic meme",
    usage: "epic [url]",
    rateLimit: 30,
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["epic", "thisisepic", "okaythisisepic", "tis"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.channel.send(`:bangbang: No image found. ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}${module.exports.usage}`);
            return;
        }
        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .resize(429)
                .append(__dirname+"/../static/epic.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "epic.png");
                    message.channel.send("", attachment);
                    fs.unlink(fileName, function unlink(err){
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};