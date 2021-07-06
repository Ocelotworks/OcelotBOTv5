/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/10/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Birthday",
    usage: "remove :user?+",
    commands: ["remove", "delete"],
    run: async function (context, bot) {
        let target = context.user;
        if (context.channel.permissionsFor(context.user.id).has("MANAGE_CHANNELS")) {


            if (message.mentions.users.size > 0)
                target = message.mentions.users.first();
            else if (args.length > 2) {
                let allBirthdays = await bot.database.getBirthdays(context.guild.id);
                let found = false;
                const search = args.slice(2).join(" ").toLowerCase();
                for (let i = 0; i < allBirthdays.length; i++) {
                    let user = await bot.util.getUserInfo(allBirthdays[i].user);
                    if (!user) continue;
                    if (user.username.toLowerCase().includes(search)) {
                        found = true;
                        target = user;
                        break;
                    }
                }
                if (!found) {
                    return context.replyLang("BIRTHDAY_REMOVE_NOT_FOUND");
                }
            }
        } else if (args.length > 2) {
            return context.replyLang("BIRTHDAY_REMOVE_PERMISSION");
        }
        await bot.database.removeBirthday(target.id, context.guild.id);
        return context.replyLang("BIRTHDAY_REMOVE_SUCCESS", {user: target});
    }
};