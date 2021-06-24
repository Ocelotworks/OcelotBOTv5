const Util = require("../util/Util");
const Image = require('../util/Image');
module.exports = {
    name: "Monochrome Image",
    usage: "monochrome [url]",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["monochrome", "blackandwhite", "greyscale"],
    run: async function(context, bot){
        const url = await Util.GetImage(bot, context);
        if(!url){
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});
        }
        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "filter": [{name: "greyscale"}],
                },
            ],
        }, 'greyscale')
    }
};