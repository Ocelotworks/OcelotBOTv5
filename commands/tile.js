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
const Util = require("../util/Util");
module.exports = {
    name: "Tile Images",
    usage: "tile :image1? :image2?",
    categories: ["image", "tools"],
    rateLimit: 100,
    commands: ["tile"],
    slashHidden: true,
    slashCategory: "filter",
    run: async function run(context, bot) {
        const url1 = await Util.GetImage(bot, context, "image1", 0);
        const url2 = await Util.GetImage(bot, context, "image2", 1);
        if (!url1 || !url2)
            return context.send("You must enter 2 images.");

        const image1 = await canvas.loadImage(url1);
        const image2 = await canvas.loadImage(url2);

        const cnv = canvas.createCanvas(image1.width + image2.width, image1.height);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(image1, 0, 0);
        ctx.drawImage(image2, image1.width, 0, image2.width, image1.height);


        return context.send({files: [new Discord.MessageAttachment(cnv.toBuffer("image/png"), "tile.png")]});
    },
};