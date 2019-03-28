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
    run: async function(message, args, bot){
        message.channel.send("Reloading...");
        if(bot.client.shard) {
            bot.client.shard.send({type: "reloadUserConfig"});
        }else {
            await bot.config.loadUserCache();
        }

    }
};