/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) rotate
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Rotate Image",
    usage: "rotate :0deg? :image?",
    categories: ["image", "filter"],
    rateLimit: 20,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rotate", "rot"],
    slashHidden: true,
    slashCategory: "filter",
    run: async function(context, bot){
        let num = context.options.deg || 90;
        return Image.ImageFilter(bot, module.exports.usage, context,"rotate", ['black', num % 360]);
    }
};