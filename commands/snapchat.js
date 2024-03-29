/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/02/2019
 * ╚════ ║   (ocelotbotv5) snapchat
 *  ════╝
 */
const Discord = require('discord.js');
const Util = require("../util/Util");
const Image = require('../util/Image');
module.exports = {
    name: "Snapchat Text",
    usage: "snapchat :image :text?+",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["snapchat", "snap"],
    slashCategory: "filter",
    run: async function(context, bot){
        const url =  await Util.GetImage(bot, context);

        if(!url)
            return context.replyLang("GENERIC_NO_IMAGE", module.exports);

        // textSize = (ch/24)
        // barHeight = (ch/12)
        // barPosition = ch - (ch/3)

        let content = `${context.options.image} ${context.options.text}`

        // This feels wrong but I don't want to deal with doing it the proper way
        if(url.startsWith("https://cdn.discord") && context.message?.mentions.users.size > 0){
            content = content.replace(new RegExp(`<@!?(${context.message.mentions.users.firstKey()})>`), "")
        }

        content = Discord.Util.cleanContent(content, context.channel);

        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "DroidSans.ttf",
                            fontSize: "ch/25",
                            colour: "#ffffff",
                            background: "#00000099",
                            bgWidth: "cw",
                            padding: "ch/15",
                            content: content,
                            x: "cw/2",
                            y: "ch/2",
                            ax: 0.5,
                            ay: 0.5,
                            w: "cw",
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "snapchat")
    }
};