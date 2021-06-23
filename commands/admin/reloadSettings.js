/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 07/12/2018
 * ╚════ ║   (ocelotbotv5) reloadSettings
 *  ════╝
 */
module.exports = {
    name: "Reload Config",
    usage: "reloadconfig :server?",
    commands: ["reloadsettings", "reloadconfig"],
    run: async function (context, bot) {
        let msg = await context.send("Reloading...");
        if (context.options.server) {
            await bot.config.reloadCacheForServer(context.options.server);
            return context.edit(`Loaded ${Object.keys(bot.config.cache[context.options.server]).length} keys for ${context.options.server}`, msg);
        }
        await bot.config.reloadCache();
       return context.edit(`Loaded keys for ${Object.keys(bot.config.cache).length} servers.`, msg);
    }
};