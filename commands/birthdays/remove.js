/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/10/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Birthday",
    usage: "remove <user>",
    commands: ["remove", "delete"],
    run: async function (message, args, bot) {
        let target = message.author;
        if(message.mentions.users.size > 0)
            target = message.mentions.users.first();
        await bot.database.removeBirthday(target.id, message.guild.id);
        message.channel.send("Birthday removed.");
    }
};