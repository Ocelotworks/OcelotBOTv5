/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 07/12/2018
 * ╚════ ║   (ocelotbotv5) reloadSettings
 *  ════╝
 */
module.exports = {
    name: "Reload Config",
    usage: "reloadconfig [server]",
    commands: ["reloadsettings", "reloadconfig"],
    run: async function(message, args, bot){
        let msg = await message.channel.send("Reloading...");
        if(args[2]){
            await bot.config.reloadCacheForServer(args[2]);
            msg.edit(`Loaded ${Object.keys(bot.config.cache[args[2]]).length} keys for ${args[2]}`);
        }else{
            await bot.config.reloadCache();
            msg.edit(`Loaded keys for ${Object.keys(bot.config.cache).length} servers.`);
        }
    }
};