/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) trim
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Trim Image",
    detailedHelp: "Removes a single colour from the border of an image",
    usage: "trim :image?",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["trim"],
    slashHidden: true,
    slashCategory: "filter",
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context, "trim", []);
    }
};