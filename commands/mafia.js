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
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["mafia", "mafiaboss"],
    categories: ["image", "memes"],
    init: async function () {
        mafiaLogo = await canvas.loadImage(__dirname + "/../static/mafia.png");
    },
    run: async function run(message, args, bot) {
        if (message.mentions.users.size < 2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);

        const user1 = bot.util.getUserFromMention(args[1]);
        const user2 = bot.util.getUserFromMention(args[2]);

        if (!user1 || !user2)
            return message.channel.send(`:bangbang: You must enter 2 users. e.g ${args[0]} ${message.author} ${bot.client.user}`);


        return bot.util.imageProcessor(message, {
            "components": [
                {
                    url: user1.avatarURL({dynamic: true, format: "png", size: 512}),
                    pos: {x: 0, y: 0},
                    filter: [{
                        name: "text",
                        args: {
                            fontSize: 50,
                            colour: "#ffffff",
                            shadowColour: "#000000",
                            content: "Level 1 Crook",
                            x: 256,
                            y: 5,
                            ax: 0.5,
                            ay: 0,
                            w: 512,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },{
                    url: user2.avatarURL({dynamic: true, format: "png", size: 512}),
                    pos: {x: 512, y: 0},
                    filter: [{
                        name: "text",
                        args: {
                            fontSize: 50,
                            colour: "#ffffff",
                            shadowColour: "#000000",
                            content: `Level ${bot.util.intBetween(30, 100)} Mafia Boss`,
                            x: 256,
                            y: 5,
                            ax: 0.5,
                            ay: 0,
                            w: 512,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                }, {
                    url: "mafia.png",
                    local: true,
                    pos: {x: 0, y: 512}
                }
            ],
            width: 1024,
            height: 632,
        }, 'mafia')
    }
};