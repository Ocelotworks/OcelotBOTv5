/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) jpeg
 *  ════╝
 */
module.exports = {
    name: "JPEG-ify",
    usage: "jpeg [url]",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jpeg", "jpg"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "quality", [message.getSetting("jpeg.quality")], "JPEG");
    }
};