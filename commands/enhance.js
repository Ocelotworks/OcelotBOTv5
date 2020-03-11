/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 28/03/2019
 * ╚════ ║   (ocelotbotv5) enhance
 *  ════╝
 */
module.exports = {
    name: "Enhance Image",
    usage: "enhance [url]",
    commands: ["enhance"],
    rateLimit: 100,
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        bot.util.processDeepAi(message, args, "torch-srgan");
    }
};