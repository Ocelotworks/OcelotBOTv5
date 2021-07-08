/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) jpeg
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "JPEG-ify",
    usage: "jpeg :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    detailedHelp: "JPEG-Ify an image",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jpeg", "jpg"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,  "quality", [context.getSetting("jpeg.quality")], "JPEG");
    }
};