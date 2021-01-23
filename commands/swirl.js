/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) swirl
 *  ════╝
 */
module.exports = {
    name: "Swirl Image",
    usage: "swirl [url]",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["swirl","spiral"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "swirl", [message.getSetting("swirl.amount")]);
    }
};