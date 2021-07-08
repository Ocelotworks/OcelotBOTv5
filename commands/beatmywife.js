const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
const Util = require("../util/Util");
module.exports = {
    name: "So Sad Meme",
    usage: "beatmywife :image?",
    rateLimit: 10,
    detailedHelp: "https://knowyourmeme.com/memes/this-is-so-sad\nOkay, maybe this is a bit of a dead meme at this point but what's done is done.",
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["beatmywife", "bmw", "sosad"],
    unwholesome: true,
    slashHidden: true,
    run: async function(context, bot){
        // As slash commands can't upload files, this command can't be done yet as
        // it doesn't use the image processor so can't upload to imgur.
        if(!context.message)
            return context.sendLang({content: "This command does not support slash commands", ephemeral: true})

        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", ()=>{
            gm(fileName)
                .resize(1070)
                .append(__dirname+"/../static/beatmywife.png")
                .toBuffer("PNG", function(err, buffer){
                    if(err)
                        return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});

                    let attachment = new Discord.MessageAttachment(buffer, "beatmywife.png");

                    context.send({files: [attachment]});
                    fs.unlink(fileName, function unlink(err){
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};