/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/04/2019
 * ╚════ ║   (ocelotbotv5) mirror
 *  ════╝
 */
module.exports = {
    name: "Spread Image",
    usage: "spread [url]",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["spread"],
    run: async function (message, args, bot) {
        return bot.util.processImageFilter(module, message, args, "spread", [message.getSetting("spread.amount")]);
    }
};