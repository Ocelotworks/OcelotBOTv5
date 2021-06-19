const Util = require("../util/Util");
const Image = require("../util/Image");
module.exports = {
    name: "Brazzers",
    usage: "brazzers :image?",
    rateLimit: 10,
    categories: ["memes", "nsfw"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["brazzers"],
    unwholesome: true,
    run: async function run(context, bot){
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    "url": url,
                    "local": false,
                },
                {
                    "url": "brazzers.png",
                    "local": true,
                    "pos": {"w": "50%", "h": "15%"},
                }
            ],
        }, 'brazzers')
    }
};


