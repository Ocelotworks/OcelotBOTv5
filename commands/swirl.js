/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) swirl
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Swirl Image",
    usage: "swirl :image?",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["swirl", "spiral"],
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,"swirl", [context.getSetting("swirl.amount")]);
    }
};