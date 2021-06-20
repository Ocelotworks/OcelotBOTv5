/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/04/2019
 * ╚════ ║   (ocelotbotv5) mirror
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Mirror Image",
    usage: "mirror :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["mirror", "flipimage"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,"flop", []);
    }
};