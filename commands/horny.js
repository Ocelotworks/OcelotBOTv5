const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Horny License",
    usage: "horny :image?",
    rateLimit: 10,
    detailedHelp: "License to be Horny",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    unwholesome: true,
    commands: ["horny"],
    slashCategory: "filter",
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "pos": {"x": 35, "y": 220, "w": 228, "h": 230},
                    "rot": -0.43057273,
                    "background": "#000000",
                },
                {
                    "url": "horny.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 630,
            "height": 579
        }, "horny")
    }
};


