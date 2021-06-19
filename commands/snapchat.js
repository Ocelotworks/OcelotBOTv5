/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/02/2019
 * ╚════ ║   (ocelotbotv5) snapchat
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Snapchat Text",
    usage: "snapchat [url] [text]",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["snapchat", "snap"],
    run: async function(message, args, bot){

        const url =  await bot.util.getImage(message, args);

        if(!url || !args[1])
            return message.replyLang("GENERIC_NO_IMAGE", module.exports);


        // textSize = (ch/24)
        // barHeight = (ch/12)
        // barPosition = ch - (ch/3)

        let content = args.slice(1).join(" ").replace(url, "");

        // This feels wrong but I don't want to deal with doing it the proper way
        if(url.startsWith("https://cdn.discord") && message.mentions.users.size > 0){
            content = content.replace(new RegExp(`<@!?(${message.mentions.users.firstKey()})>`), "")
        }

        content = Discord.Util.cleanContent(content, message);

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