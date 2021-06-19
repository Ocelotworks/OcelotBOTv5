const Util = require("../util/Util");
const Image = require("../util/Image");
module.exports = {
    name: "Dictator Meme",
    usage: "dictator :image?",
    rateLimit: 10,
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["dictator", "chairman", "mao"],
    run: async function run(context, bot){
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "local": false,
                    "pos": {"x": 225, "y": 120, "w": 152, "h": 196},
                    "rot": 0,
                    "filter": [],
                    "background": "#000000"
                },
                {
                    "url": "dictator.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 598,
            "height": 465
        }, 'dictator')
    }
};


