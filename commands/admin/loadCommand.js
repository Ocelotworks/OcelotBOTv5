/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) loadCommand
 *  ════╝
 */
module.exports = {
    name: "Load Command",
    usage: "loadCommand :command",
    commands: ["loadcommand", "lc", "load", "reload", "reloadcommand", "rc"],
    slashHidden: true,
    init: function init(bot) {
        bot.bus.on("loadCommand", (msg) => {
            try {
                bot.loadCommand(msg.message, true)
            } catch (e) {
                bot.raven.captureException(e);
                console.error(e);
            }
        });
    },
    run: async function (context, bot) {
        await bot.rabbit.event({type: "loadCommand", message: context.options.command});
        bot.logger.log("Loading Command");
        context.send("Loading command " +context.options.command);
    }
};