/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 04/12/2018
 * ╚════ ║   (ocelotbotv5) ban
 *  ════╝
 */
module.exports = {
    name: "Ban User",
    usage: "ban <user>",
    commands: ["ban"],
    run: async function(message, args, bot){
        const target = message.mentions.users.first() ? message.mentions.users.first().id : args[2];
        await bot.database.ban(target, "user", "Admin ban");
        bot.banCache.user.push(target);
        message.channel.send(`<@${target}> has been banned!`);
    }
};