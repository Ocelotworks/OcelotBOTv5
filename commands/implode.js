/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) implode
 *  ════╝
 */
const Image = require('../util/Image');
module.exports = {
    name: "Implode Image",
    usage: "implode :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["implode"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context, "implode", [message.getSetting("implode.amount")]);
    }
};