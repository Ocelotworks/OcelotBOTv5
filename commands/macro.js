const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Image Macro",
    usage: "macro :image? :text?+",
    rateLimit: 10,
    detailedHelp: "Make an image macro meme like it's 2011 again",
    usageExample: "macro we live in a society / bottom text",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["imagemacro", "macro"],
    categories: ["image", "memes"],
    run: async function (context, bot) {
        const url = await Util.GetImage(bot, context);
        if (!url)
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});
        let fullText = (`${context.options.image || ""} ${context.options.text || ""}`).replace(url, "");
        if(url.startsWith("https://cdn.discord") && context.message?.mentions.users.size > 0){
            fullText = fullText.replace(new RegExp(`<@!?(${context.message.mentions.users.firstKey()})>`), "")
        }
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