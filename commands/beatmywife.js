const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "So Sad Meme",
    usage: "beatmywife [url]",
    rateLimit: 10,
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["beatmywife", "bmw", "sosad"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
            return;
        }
        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .resize(1070)
                .append(__dirname+"/../static/beatmywife.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "beatmywife.png");
                    message.channel.send("", attachment);
                    fs.unlink(fileName, function unlink(err){
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};