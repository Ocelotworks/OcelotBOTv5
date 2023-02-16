/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/04/2019
 * ╚════ ║   (ocelotbotv5) curse
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
const Util = require("../util/Util");
module.exports = {
    name: "Curse Image",
    usage: "curse :image?+",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["curse", "cursed"],
    slashCategory: "filter",
    run: async function (context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        console.log(url);

        const fileName = `${__dirname}/../temp/${Math.random()}.png`;

        request({url, timeout: 10000}).on("end", () => {
            gm(fileName)
                .modulate(50)
                .gamma(1, 0.8, 0.8)
                //.edge(50)
                .quality(50)
                .toBuffer("JPEG", function (err, buffer) {
                    if (err)
                        return context.replyLang("GENERIC_ERROR");
                    let attachment = new Discord.MessageAttachment(buffer, "jpeg.jpg");
                    context.send({files: [attachment]}).catch(function (e) {
                        console.log(e);
                        context.send("Upload error: " + e);
                    });
                    fs.unlink(fileName, function () {
                    });
                });
        }).pipe(fs.createWriteStream(fileName));

    }
};