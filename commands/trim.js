/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) trim
 *  ════╝
 */
module.exports = {
    name: "Trim Image",
    usage: "trim [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["trim"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "trim", []);
    }
};