/**
 *   ╔════   Copyright 2020 Peter Maguire
 *  ║ ════╗  Created 11/09/2020
 * ╚════ ║   (ocelotbotv5) pet
 *  ════╝
 */
const CanvasGifEncoder = require('../lib/canvas-gif-encoder');
const Discord = require('discord.js');
const canvas = require('canvas');
const size = 112;
const frames = [{"x":18,"y":18,"w":98,"h":98},{"x":14,"y":30,"w":102,"h":86},{"x":6,"y":36,"w":110,"h":80},{"x":6,"y":30,"w":102,"h":86},{"x":14,"y":18,"w":98,"h":98}];

const ignoredArgs = ["play", "explore", "stats", "walk", "feed", "🍆", "clean"];

module.exports = {
    name: "Pet Pet",
    usage: "pet [url or @user]",
    categories: ["fun", "image"],
    rateLimit: 100,
    commands: ["pet", "petpet"],
    run: async function run(message, args, bot) {
        if(args[1] && ignoredArgs.includes(args[1].toLowerCase()))return;
        let avatarURL = await bot.util.getImage(message, args);
        if(!avatarURL)
            return message.channel.send("You must enter an image URL or mention a user");
        message.channel.startTyping();
        try {
            let span = bot.apm.startSpan("Load avatar");
            const avatar = await canvas.loadImage(avatarURL);
            span.end();
            span = bot.apm.startSpan("Load sprite");
            const sprite = await canvas.loadImage(__dirname + "/../static/petpet.png")
            span.end();
            const canvas1 = canvas.createCanvas(size, size);

            const ctx1 = canvas1.getContext("2d");
            const canvas2 = canvas.createCanvas(size, size);
            const ctx2 = canvas2.getContext("2d");

            const encoder = new CanvasGifEncoder(size, size);
            const stream = encoder.createReadStream();
            let bufs = [];

            stream.on('data', (buffer) => {
                bufs.push(buffer);
            })

            stream.on('end', () => {
                const buffer = Buffer.concat(bufs);
                message.channel.send("", new Discord.MessageAttachment(buffer, "petpet.gif"));
            })

            encoder.begin();

            for (let i = 0; i < frames.length; i++) {
                let span = bot.apm.startSpan("Render frame");
                const frame = frames[i];
                ctx2.clearRect(0, 0, size, size);
                ctx2.drawImage(avatar, frame.x, frame.y, frame.w, frame.h);
                ctx2.drawImage(sprite, i * size, 0, size, size, 0, 0, size, size);

                ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
                ctx1.drawImage(canvas2, 0, 0, canvas1.width, canvas1.height);

                encoder.addFrame(ctx1, 50);
                span.end();
            }
            encoder.end();
            message.channel.stopTyping(true);

        }catch(e){
            bot.raven.captureException(e);
            message.replyLang("GENERIC_ERROR");
        }finally{
            message.channel.stopTyping(true);
        }
    },
};