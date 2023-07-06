/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) jpeg
 *  ════╝
 */
const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "JPEG-ify",
    usage: "jpeg :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    detailedHelp: "JPEG-Ify an image",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jpeg", "jpg"],
    slashCategory: "filter",
    run: async function (context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        if(url.endsWith(".gif"))
            return context.send({content: "This command does not support GIFs", ephemeral: true});

        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    "url": url,
                    "local": false,
                },
            ],
            output: {
                format: "jpeg",
                quality: parseInt(context.getSetting("jpeg.quality")),
            }
        }, 'jpeg')
    }
};