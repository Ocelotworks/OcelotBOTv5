const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Lower Image",
    usage: "lower [url]",
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["lower"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !url.startsWith("http")){
            message.channel.send(":bangbang: No image found. !"+module.exports.usage);
            return;
        }
        console.log(url);


        const fileName = `temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .lower(100, 100)
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.Attachment(buffer, "lower.png");
                    message.channel.send("", attachment);
                    fs.unlinkSync(fileName);
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};