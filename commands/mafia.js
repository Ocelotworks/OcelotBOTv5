/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/01/2019
 * ╚════ ║   (ocelotbotv5) mafia
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Mafia Boss",
    usage: "mafia :@user1 :@user2",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["mafia", "mafiaboss"],
    categories: ["memes"],
    guildOnly: true,
    slashCategory: "images",
    run: async function run(context, bot) {
        const user1 =  (await context.guild.members.fetch(context.options.user1))?.user;
        const user2 =  (await context.guild.members.fetch(context.options.user2))?.user;

        if (!user1 || !user2)
            return context.send({content:`:bangbang: You must enter 2 users. e.g ${context.command} ${context.user} ${bot.client.user}`, ephemeral: true});

        return Image.ImageProcessor(bot, context,  {
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