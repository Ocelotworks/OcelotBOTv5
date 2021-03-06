/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) paint
 *  ════╝
 */
module.exports = {
    name: "Oil Painting",
    usage: "paint [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["paint", "oil", "oilpaint"],
    run: async function (message, args, bot) {
        return bot.util.processImageFilter(module, message, args, "paint", [10]);
    }
};