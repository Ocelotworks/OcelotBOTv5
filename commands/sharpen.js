/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) sharpen
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Sharpen Image",
    usage: "sharpen :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["sharpen", "edge"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,"edge", [5]);
    }
};