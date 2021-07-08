/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) reloadUserConfig
 *  ════╝
 */
module.exports = {
    name: "Reload User Config",
    usage: "reloaduserconfig",
    commands: ["reloaduserconfig", "ruc"],
    run: async function (context, bot) {
        context.send("Reloading...");
        bot.rabbit.event({type: "reloadUserConfig"});
    }
};