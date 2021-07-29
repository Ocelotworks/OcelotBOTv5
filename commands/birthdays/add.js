/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
const chrono = require('chrono-node');
module.exports = {
    name: "Add Birthday",
    usage: "add :@addUser? :date+",
    commands: ["add", "new"],
    run: async function (context, bot) {
        let target = context.user;
        if (context.options.addUser)
            target = [context.channel.guildMembers || context.channel.members].get(context.options.addUser).user;
        let date = chrono.parseDate(context.options.date);
        if (!date)
            return context.sendLang({content: "BIRTHDAY_ADD_DATE", ephemeral: true}, {command: context.command, arg: context.options.command, user: bot.client.user});
        const age = (new Date().getFullYear() - date.getFullYear());
        if (age > 2 && age < 13)
            return context.sendLang({content: "BIRTHDAY_AGE", ephemeral: true});

        try {
            await bot.database.addBirthday(target.id, context.guild.id, date);
            if (target.username.startsWith("Deleted User "))
                context.sendLang("BIRTHDAY_DELETED_USER");


            if(target.id === bot.client.user.id && date.getFullYear() !== 2013 && date.getMonth() !== 6 && date.getDate() !== 15)
                return context.send(":tada: Birthday added! My birthday is actually **15th July 2013**, by the way.");

            return context.sendLang("BIRTHDAY_ADD_SUCCESS");
        } catch (e) {
            const message = {content: "BIRTHDAY_ADD_EXISTS", ephemeral: true};
            if(context.channel.permissionsFor(context.user.id).has("MANAGE_CHANNELS"))
                message.components = [bot.util.actionRow(bot.interactions.suggestedCommand(context, `remove ${target.username}`))]
            else if(target.id === context.user.id)
                message.components = [bot.util.actionRow(bot.interactions.suggestedCommand(context, `remove`))]
            return context.sendLang(message, {command: context.command, target});
        }
    }
};