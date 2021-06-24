const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
const Util = require("../util/Util");
module.exports = {
    name: "We live in a society meme",
    usage: "society :image?",
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    rateLimit: 10,
    commands: ["society", "weliveinasociety", "wlias"],
    run: async function(context, bot){

        const url =  await Util.GetImage(bot, context);

        if(!url || !url.startsWith("http")){
            context.send(`:bangbang: No image found. ${context.getSetting("prefix")}${module.exports.usage}`);
            return;
        }
        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        var req = request(url);


        req.on("error", function(err){
            context.send(":bangbang: Error getting image: "+err.message);
        });


        req.on("end", ()=>{
            gm(fileName)
                .resize(660)
                .append(__dirname+"/../static/society.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.MessageAttachment(buffer, "society.png");
                    context.send({files: [attachment]});
                    fs.unlinkSync(fileName);
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};