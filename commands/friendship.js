/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/05/2019
 * ╚════ ║   (ocelotbotv5) friendship
 *  ════╝
 */
const Discord = require('discord.js');
const canvas = require('canvas');
let background, cross1, cross2, overlay;
module.exports = {
    name: "Friendship ended with",
    usage: "friendship <@user1> <@user2>",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["friendship", "freindship"],
    categories: ["image", "memes"],
    unwholesome: true,
    init: async function(){
        background = await canvas.loadImage(__dirname+"/../static/friendship.png");
        cross1 = await canvas.loadImage(__dirname+"/../static/friendship_cross1.png");
        cross2 = await canvas.loadImage(__dirname+"/../static/friendship_cross2.png");
        overlay = await canvas.loadImage(__dirname+"/../static/friendship_overlay.png");
    },
    run: async function run(message, args, bot) {
        if(message.mentions.users.size < 2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);

        console.log("Loading users");

        const user1 = bot.util.getUserFromMention(args[1]);
        const user2 = bot.util.getUserFromMention(args[2]);

        if(!user1 || !user2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);

        console.log("Loading Avatars");
        if(!user1.avatarURL({dynamic: true, format: "png"}) || !user2.avatarURL({dynamic: true, format: "png"}))
            return message.replyLang("MAFIA_NO_AVATAR");

        const endedWith = await canvas.loadImage(user1.avatarURL({dynamic: true, format: "png"}));
        const bestfriend = await canvas.loadImage(user2.avatarURL({dynamic: true, format: "png"}));
        const author = await canvas.loadImage(message.author.avatarURL({dynamic: true, format: "png"}));

        const cnv = canvas.createCanvas(680, 510);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(background, 0,0);

        ctx.drawImage(endedWith, -60,282,227, 227);
        ctx.drawImage(cross1, 0,306);
        ctx.drawImage(endedWith, 492,306,189, 203);
        ctx.drawImage(cross2, 493,330);

        ctx.drawImage(author, 112,47,148, 148);
        ctx.drawImage(bestfriend, 420,116,150, 150);

        ctx.drawImage(overlay, 105,0);

        let endedGradient = ctx.createLinearGradient(106.000, 0.000, 106.000, 60.000);

        endedGradient.addColorStop(0.000, 'rgba(205, 73, 8, 1.000)');
        endedGradient.addColorStop(1.000, 'rgba(64, 188, 74, 1.000)');

        ctx.font = "80px Impact";
        ctx.fillStyle = endedGradient;
        ctx.strokeStyle = "#134673";

        ctx.fillText(user1.username, 450,71, 228);
        ctx.strokeText(user1.username, 450, 71, 228);

        ctx.font = "50px Impact";
        ctx.fillStyle = "rgba(179, 61, 73, 1.000)";

        ctx.fillText(user2.username, 264,186, 146);
        ctx.strokeText(user2.username, 264,186, 146);


        message.channel.send("", new Discord.MessageAttachment(cnv.toBuffer("image/png"), "friendship.png"));

    }
};