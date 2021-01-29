/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 07/12/2018
 * ╚════ ║   (ocelotbotv5) setConfig
 *  ════╝
 */

module.exports = {
    name: "Set Config Key",
    usage: "setconfig server key value",
    commands: ["setconfig", "sc"],
    run: async function(message, args, bot){
        const server = args[2] === "this" ? message.guild.id : args[2];
        const key = args[3];
        const value = message.content.substring(args[0].length+args[1].length+args[2].length+args[3].length+4);
        if(!server || !key){
            message.channel.send("Invalid usage. !admin setconfig server key value");
        }else{
            await bot.database.setSetting(server, key, value, bot.client.user.id);
            if(bot.client.shard) {
                bot.rabbit.event({type: "reloadConfig", payload: server});
            }else {
                await bot.config.reloadCacheForServer(server);
            }
            message.channel.send("Set setting and reloaded cache.");
        }
    }
};