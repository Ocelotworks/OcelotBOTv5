/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) sharpen
 *  ════╝
 */
module.exports = {
    name: "Sharpen Image",
    usage: "sharpen [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["sharpen", "edge"],
    run: function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "edge", [5]);
    }
};