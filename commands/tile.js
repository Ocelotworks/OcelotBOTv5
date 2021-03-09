/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/11/2019
 * ╚════ ║   (ocelotbotv5) tile
 *  ════╝
 */
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/08/2019
 * ╚════ ║   (ocelotbotv5) overlay
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
module.exports = {
    name: "Tile Images",
    usage: "tile <image1> <image2>",
    categories: ["image", "tools"],
    rateLimit: 100,
    commands: ["tile"],
    run: async function run(message, args, bot) {
        let url1 = await bot.util.getImage(message, args, 1);
        let url2 = await bot.util.getImage(message, args, 2);
        if (!url1 || !url2)
            return message.channel.send("You must enter 2 images.");

        if (!args[2]) {
            const tempUrl1 = url1;
            url1 = url2;
            url2 = tempUrl1;
        }

        const image1 = await canvas.loadImage(url1);
        const image2 = await canvas.loadImage(url2);

        const cnv = canvas.createCanvas(image1.width + image2.width, image1.height);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(image1, 0, 0);
        ctx.drawImage(image2, image1.width, 0, image2.width, image1.height);


        message.channel.send("", new Discord.MessageAttachment(cnv.toBuffer("image/png"), "tile.png"));
    },
};