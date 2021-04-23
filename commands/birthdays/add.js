/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
const chrono = require('chrono-node');
module.exports = {
    name: "Add Birthday",
    usage: "add @user date",
    commands: ["add", "new"],
    run: async function (message, args, bot) {
        let target = message.author;
        if (message.mentions.users.size > 0)
            target = message.mentions.users.first();
        let date = chrono.parseDate(message.content);
        if (!date)
            return message.replyLang("BIRTHDAY_ADD_DATE", {command: args[0], arg: args[1], user: bot.client.user});
        const age = (new Date().getFullYear() - date.getFullYear());
        if (age > 2 && age < 13) {
            return message.replyLang("BIRTHDAY_AGE");
        }
        try {
            await bot.database.addBirthday(target.id, message.guild.id, date);
            if (target.username.startsWith("Deleted User ")) {
                message.replyLang("BIRTHDAY_DELETED_USER");
            }

            if(target.id === bot.client.user.id && date.getFullYear() !== 2013 && date.getMonth() !== 6 && date.getDate() !== 15){
                return message.channel.send(":tada: Birthday added! My birthday is actually **15th July 2013**, by the way.");
            }

            message.replyLang("BIRTHDAY_ADD_SUCCESS");
        } catch (e) {
            message.replyLang("BIRTHDAY_ADD_EXISTS", {command: args[0], target});
        }
    }
};