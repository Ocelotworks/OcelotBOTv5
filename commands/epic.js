const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
const Util = require("../util/Util");
const Sentry = require('@sentry/node');
module.exports = {
    name: "This is epic meme",
    usage: "epic :image?",
    rateLimit: 30,
    detailedHelp: "Okay, now THIS is epic.",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["epic", "thisisepic", "okaythisisepic", "tis"],
    slashCategory: "filter",
    run: async function (context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request({url, timeout: 10000}).on("end", () => {
            gm(fileName)
                .resize(429)
                .append(__dirname + "/../static/epic.png")
                .toBuffer("PNG", function (err, buffer) {
                    if (err) {
                        Sentry.captureException(err);
                        context.replyLang("GENERIC_ERROR");
                        return;
                    }
                    let attachment = new Discord.MessageAttachment(buffer, "epic.png");
                    context.send({files: [attachment]});
                    fs.unlink(fileName, function unlink(err) {
                        Sentry.captureException(err);
                        console.log(err);
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};