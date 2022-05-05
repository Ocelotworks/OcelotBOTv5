/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/05/2019
 * ╚════ ║   (ocelotbotv5) friendship
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Full of",
    usage: "fullof :@user? :item?+",
    detailedHelp: "Someone is full of something.",
    usageExample: "fullof @Cat soup",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["fullof", "fullofsoup"],
    categories: ["image"],
    run: async function run(context, bot) {

        const user1 = (context.channel.guildMembers || context.channel.members).get(context.options.user)?.user || context.user;

        if(!user1)
            return context.sendLang({content: "MAFIA_NOT_ENOUGH_USERS", ephemeral: true}, {them: context.user, me: bot.client.user});

        let payload = {
            "components": [
                {
                    url: "soupcat.png",
                    local: true,
                },
                {
                    url: user1.avatarURL({dynamic: true, format: "png", size: 64}),
                    pos: {x: 91, y: 4, w: 66, h: 66}
                },
            ],
        }

        if(context.options.item){
            payload.components.push({
                pos: {
                    x: 50,
                    y: 31,
                    w: 120,
                    h: 160,
                },
                filter: [{
                name: "text",
                args: {
                    content: context.options.item,
                    fontSize: 24,
                    colour: "#ff0000",
                    background: "#000000",
                }
            }]});
        }

        return Image.ImageProcessor(bot, context, payload, 'fullof');
    }
};