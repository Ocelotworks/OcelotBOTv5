/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) paint
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Oil Painting",
    usage: "paint :image?",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["paint", "oil", "oilpaint"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,"paint", [10]);
    }
};