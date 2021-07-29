/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/05/2019
 * ╚════ ║   (ocelotbotv5) friendship
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Friendship ended with",
    usage: "friendship :@user1 :@user2",
    detailedHelp: "Officially end your friendship with someone.",
    usageExample: "friendship @Big P @Small P",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["friendship", "freindship"],
    categories: ["memes"],
    unwholesome: true,
    run: async function run(context, bot) {

        const user1 = [context.channel.guildMembers || context.channel.members].get(context.options.user1).user;
        const user2 = [context.channel.guildMembers || context.channel.members].get(context.options.user2).user;

        if(!user1 || !user2)
            return context.send({content:`:bangbang: You must enter 2 users. e.g ${context.command} ${context.user} ${bot.client.user}`, ephemeral: true});

        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    url: "friendship.png",
                    local: true,
                    filter: [{
                        name: "text",
                        args: {
                            x: 450,
                            y: 5,
                            w: 228,
                            font: "impact.ttf",
                            content: user1.username,
                            fontSize: 80,
                            outlineColour: "#134673",
                            gradient: ["#CD4908", "#40BC4A"]
                        }
                    }, {
                        name: "text",
                        args: {
                            x: 240,
                            y: 150,
                            w: 146,
                            font: "impact.ttf",
                            content: user2.username,
                            fontSize: 50,
                            colour: "#B33D49FF",
                        }
                    }]
                },
                {
                    url: context.user.avatarURL({dynamic: true, format: "png", size: 128}),
                    pos: {x: 112, y: 47, w: 148, h: 148}
                },
                {
                    url: user1.avatarURL({dynamic: true, format: "png", size: 256}),
                    pos: {x: -60, y: 282, w: 227, h: 227}
                },
                {
                    url: user1.avatarURL({dynamic: true, format: "png", size: 256}),
                    pos: {x: 492, y: 306, w: 189, h: 203}
                },
                {
                    url: user2.avatarURL({dynamic: true, format: "png", size: 128}),
                    pos: {x: 420, y: 116, w: 150, h: 150}
                },
                {
                    url: "friendship_cross1.png",
                    local: true,
                    pos: {x: 0, y: 306}
                },
                {
                    url: "friendship_cross2.png",
                    local: true,
                    pos: {x: 493, y: 330}
                }
            ],
        }, 'friendship');
    }
};