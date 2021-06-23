module.exports = {
    name: "Image Macro",
    usage: "macro [image] <top text> / <bottom text>",
    rateLimit: 10,
    detailedHelp: "Make an image macro meme like it's 2011 again",
    usageExample: "macro we live in a society / bottom text",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["imagemacro", "macro"],
    categories: ["image", "memes"],
    run: async function (message, args, bot) {
        if (!args[1]) {
            return message.channel.send(`Enter up to two things like: **${context.command} top text** or **${context.command} top text / bottom text**`)
        }
        const url = await bot.util.getImage(message, args);
        if (!url)
            return message.replyLang("CRUSH_NO_USER");
        const fullText = message.cleanContent.substring(context.command.length).replace(url, "").toUpperCase();
        let first = fullText;
        let second = "";
        if(fullText.indexOf("/") > -1){
            const split = fullText.split("/");
            first = split[0].trim();
            second = split[1].trim();
        }
        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "impact.ttf",
                            fontSize: "0.1 * ch",
                            colour: "#ffffff",
                            outlineColour: "#000000",
                            content: first,
                            x: 0,
                            y: "0.025 * ch",
                            ax: 0,
                            ay: 0,
                            w: "cw",
                            spacing: 1.3,
                            align: 1,
                        }
                    }, {
                        name: "text",
                        args: {
                            font: "impact.ttf",
                            fontSize: "0.1 * ch",
                            colour: "#ffffff",
                            outlineColour: "#000000",
                            content: second,
                            x: 0,
                            y: "0.975 * ch",
                            ax: 0,
                            ay: 1,
                            w: "cw",
                            spacing: 1.3,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "macro")
    }
};