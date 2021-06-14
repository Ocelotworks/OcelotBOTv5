const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "This is epic meme",
    usage: "epic [url]",
    rateLimit: 30,
    detailedHelp: "Okay, now THIS is epic.",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["epic", "thisisepic", "okaythisisepic", "tis"],
    run: async function (message, args, bot) {

        const url = await bot.util.getImage(message, args);

        if (!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});

        console.log(url);


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request(url).on("end", () => {
            gm(fileName)
                .resize(429)
                .append(__dirname + "/../static/epic.png")
                .toBuffer("PNG", function (err, buffer) {
                    if (err) {
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.MessageAttachment(buffer, "epic.png");
                    message.channel.send({files: [attachment]});
                    fs.unlink(fileName, function unlink(err) {
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};