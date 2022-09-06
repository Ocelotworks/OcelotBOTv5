const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Whisper",
    usage: "whisper :input+",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["whisper"],
    categories: ["memes"],
    slashCategory: "filter",
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: async function(context, bot){
        const url = await Util.GetImage(bot, context);
        if (!url)
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});
        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    url,
                    "filter": [{
                        name: "text",
                        args: {
                            fontSize: "0.1 * ch",
                            colour: "#ffffff",
                            outlineColour: "#000000",
                            content: context.options.input,
                            font: "Upright.ttf",
                            x: "ctxw/2",
                            y: "ctxh/2",
                            ax: 0.5,
                            ay: 0.5,
                            w: "100%",
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "lisa");
    }
};
