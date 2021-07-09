/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/04/2019
 * ╚════ ║   (ocelotbotv5) mirror
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Spread Image",
    usage: "spread :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["spread"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context, "spread", [context.getSetting("spread.amount")]);
    }
};