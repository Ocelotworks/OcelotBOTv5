/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) jpeg
 *  ════╝
 */
module.exports = {
    name: "Mirror Image",
    usage: "mirror [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["mirror", "flipimage"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "flip", [], "PNG");
    }
};