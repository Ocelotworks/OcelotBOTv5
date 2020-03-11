/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 28/03/2019
 * ╚════ ║   (ocelotbotv5) recolor
 *  ════╝
 */
module.exports = {
    name: "Recolour Image",
    usage: "recolour [url]",
    commands: ["recolour", "recolor", "colourise", "colorize", "colourize", "colorise"],
    rateLimit: 100,
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        bot.util.processDeepAi(message, args, "colorizer");
    }
};