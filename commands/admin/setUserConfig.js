/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) setUserConfig
 *  ════╝
 */
module.exports = {
    name: "Set User Config Key",
    usage: "setuserconfig user key value",
    commands: ["setuserconfig", "suc"],
    run: async function(message, args, bot){
        const user = args[2] === "me" ? message.author.id : args[2];
        const key = args[3];
        const value = message.content.substring(args[0].length+args[1].length+args[2].length+args[3].length+4);
        if(!user || !key){
            message.channel.send("Invalid usage. !admin setuserconfig user key value");
        }else{
            await bot.database.setUserSetting(user, key, value);
            if(bot.client.shard) {
                bot.client.shard.send({type: "reloadUserConfig"});
            }else {
                await bot.config.loadUserCache();
            }
            message.channel.send("Set setting and reloaded cache.");
        }
    }
};