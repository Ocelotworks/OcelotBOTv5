/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/01/2019
 * ╚════ ║   (ocelotbotv5) mafia
 *  ════╝
 */

const Discord = require('discord.js');
const canvas = require('canvas');
let mafiaLogo;
module.exports = {
    name: "Mafia Boss",
    usage: "mafia <@user1> <@user2>",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["mafia", "mafiaboss"],
    categories: ["image", "memes"],
    init: async function(){
        mafiaLogo = await canvas.loadImage("static/mafia.png");
    },
    run: async function run(message, args, bot) {


        if(message.mentions.users.size < 2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);

        const user1 = bot.util.getUserFromMention(args[1]);
        const user2 = bot.util.getUserFromMention(args[2]);

        if(!user1 || !user2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);

        if(!user1.avatarURL || !user2.avatarURL)
            return message.channel.send("Both users must have an avatar.");

        const avatar1 = await canvas.loadImage(user1.avatarURL);
        const avatar2 = await canvas.loadImage(user2.avatarURL);

        const cnv = canvas.createCanvas(680, 460);
        const ctx = cnv.getContext("2d");

        ctx.drawImage(avatar1, 0,0,340, 340);
        ctx.drawImage(avatar2, 340,0,340, 340);

        ctx.font = "40px Sans serif";
        ctx.fillStyle = "white";
        ctx.strokeStyle = 'black';

        ctx.fillText("Level 1 Crook", 40,40);
        ctx.strokeText("Level 1 Crook", 40,40);

        ctx.font = "30px Sans serif";
        const secondText = `Level ${bot.util.intBetween(30, 100)} Mafia Boss`;
        ctx.fillText(secondText, 350,40);
        ctx.strokeText(secondText, 350,40);




        ctx.drawImage(mafiaLogo, 0, 340);

        message.channel.send("", new Discord.Attachment(cnv.toBuffer("image/png"), "mafia.png"));

    }
};