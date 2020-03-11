/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 28/03/2019
 * ╚════ ║   (ocelotbotv5) deepdream
 *  ════╝
 */
module.exports = {
    name: "Deepdream Image",
    usage: "deepdream [url]",
    commands: ["deepdream"],
    rateLimit: 100,
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        bot.util.processDeepAi(message, args, "deepdream");
    }
};