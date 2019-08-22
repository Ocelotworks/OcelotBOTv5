/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/08/2019
 * ╚════ ║   (ocelotbotv5) overlay
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
module.exports = {
    name: "Overlay Images",
    usage: "overlay <image1> <image2>",
    categories: ["fun", "image"],
    rateLimit: 100,
    commands: ["overlay", "combine"],
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.channel.send("You must enter 2 images to overlay. e.g !overlay @user1 @user2");



        let url1 = await bot.util.getImage(message,  args, 1);
        let url2 = await bot.util.getImage(message,  args, 2);
        if(!url1)
            return message.channel.send("You must enter 2 images.");

        if(!url2) {
            let newImage = await bot.util.getImageFromPrevious(message);
            if(newImage){
                url2 = url1;
                url1 = newImage;
            }else
                return message.channel.send("You must enter 2 images.");
        }

        const image1 = await canvas.loadImage(url1);
        const image2 = await canvas.loadImage(url2);

        const cnv = canvas.createCanvas(image1.width, image1.height);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(image1, 0,0);
        ctx.drawImage(image2, 0, 0, image1.width, image1.height);


        message.channel.send("", new Discord.Attachment(cnv.toBuffer("image/png"), "overlay.png"));
    },
};