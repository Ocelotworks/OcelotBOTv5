/**
 *   ╔════   Copyright 2020 Peter Maguire
 *  ║ ════╗  Created 11/09/2020
 * ╚════ ║   (ocelotbotv5) pet
 *  ════╝
 */
const CanvasGifEncoder = require('../lib/canvas-gif-encoder');
const Discord = require('discord.js');
const canvas = require('canvas');
const Util = require("../util/Util");
const size = 112;
const frames = [{"x": 18, "y": 18, "w": 98, "h": 98}, {"x": 14, "y": 30, "w": 102, "h": 86}, {
    "x": 6,
    "y": 36,
    "w": 110,
    "h": 80
}, {"x": 6, "y": 30, "w": 102, "h": 86}, {"x": 14, "y": 18, "w": 98, "h": 98}];

const ignoredArgs = ["play", "explore", "stats", "walk", "feed", "clean", "train", "rename"];

module.exports = {
    name: "Pet Pet",
    usage: "pet :image?",
    categories: ["image", "filter"],
    rateLimit: 100,
    commands: ["pet", "petpet"],
    run: async function run(context, bot) {
        if (context.guild && !context.command.endsWith("petpet") && ignoredArgs.includes(context.options.image?.toLowerCase())) {
            context.send(`:warning: It looks like you're trying to use ${context.command} with a different bot, I will now temporarily disable the ${context.command} command on OcelotBOT for you so as not to spam.
To prevent this in the future, consider changing OcelotBOT's prefix with **${context.getSetting("prefix")}settings set prefix** or disabling the pet command with **${context.getSetting("prefix")}settings disableCommand pet**.
You can still access this command with ${context.getSetting("prefix")}petpet`);
            if (!bot.config.cache[context.guild.id])
                bot.config.cache[context.guild.id] = {};
            bot.config.cache[context.guild.id]["pet.disable"] = "1";
            return
        }
        let avatarURL = await Util.GetImage(bot, context);
        if (!avatarURL)
            return context.send({content: "You must enter an image URL or mention a user", ephemeral: true});
        context.defer();
        try {
            let span = bot.util.startSpan("Load avatar");
            const avatar = await canvas.loadImage(avatarURL);
            span.end();
            span = bot.util.startSpan("Load sprite");
            const sprite = await canvas.loadImage(__dirname + "/../static/petpet.png")
            span.end();
            const canvas1 = canvas.createCanvas(size, size);

            const ctx1 = canvas1.getContext("2d");
            const canvas2 = canvas.createCanvas(size, size);
            const ctx2 = canvas2.getContext("2d");

            const encoder = new CanvasGifEncoder(size, size);
            encoder.begin();

            let promises = [];
            for (let i = 0; i < frames.length; i++) {
                let span = bot.util.startSpan("Render frame");
                const frame = frames[i];
                ctx2.clearRect(0, 0, size, size);
                ctx2.drawImage(avatar, frame.x, frame.y, frame.w, frame.h);
                ctx2.drawImage(sprite, i * size, 0, size, size, 0, 0, size, size);

                ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
                ctx1.drawImage(canvas2, 0, 0, canvas1.width, canvas1.height);

                promises.push(encoder.addFrame(ctx1, 50, i));
                span.end();
            }
            bot.logger.log(`Rendering ${promises.length} frames...`);
            await Promise.all(promises);
            bot.logger.log("Uploading...");
            context.send({files: [new Discord.MessageAttachment(encoder.end(), "petpet.gif")]});
        } catch (e) {
            bot.raven.captureException(e);
            context.replyLang("GENERIC_ERROR");
        } 
    },
};