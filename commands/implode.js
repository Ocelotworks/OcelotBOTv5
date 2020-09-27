/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) implode
 *  ════╝
 */
module.exports = {
    name: "Implode Image",
    usage: "implode [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["implode"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "implode", [message.getSetting("implode.amount")]);
    }
};