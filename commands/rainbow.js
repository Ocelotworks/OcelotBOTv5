const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Rainbow Image",
    usage: "rainbow :image?",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rainbow", "rainbowimage"],
    run: async function run(context, bot){
        const url = await Util.GetImage(bot, context)
        if(!url)
            return context.replyLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "filter": [{name: "rainbow"}],
                },
            ],
        }, 'rainbow')
    }
};


