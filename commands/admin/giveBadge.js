/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) giveBadge
 *  ════╝
 */
module.exports = {
    name: "Give Badge",
    usage: "giveBadge <user> <id>",
    commands: ["givebadge"],
    run: async function(message, args, bot){
       let id = args[3];
       let user = message.mentions.users.first();
       await bot.database.giveBadge(user.id, id);
       message.channel.send("Done");
    }
};