const Util = require("../util/Util");
const Image = require("../util/Image");
module.exports = {
    name: "Crush",
    usage: "crush :image?",
    rateLimit: 10,
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["crush"],
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});
        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    "url": url,
                    "local": false,
                    "pos": {"x": 106, "y": 436, "w": 453, "h": 447},
                    "rot": -0.087441,
                    "filter": [],
                    "background": "#000000"
                },
                {
                    "url": "crush.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 600,
            "height": 875
        }, 'crush');
    }
};


