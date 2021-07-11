/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/10/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Remove Birthday",
    usage: "remove :user?+",
    commands: ["remove", "delete"],
    run: async function (context, bot) {
        let target = context.user;
        if (context.channel.permissionsFor(context.user.id).has("MANAGE_CHANNELS")) {
            const mention = Strings.GetUserFromMention(bot, context.options.user);
            if(mention){
                target = mention;
            } else if (context.options.user) {
                let allBirthdays = await bot.database.getBirthdays(context.guild.id);
                let found = false;
                const search = context.options.user;
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
        } else if (context.user) {
            return context.replyLang("BIRTHDAY_REMOVE_PERMISSION");
        }
        await bot.database.removeBirthday(target.id, context.guild.id);
        return context.replyLang("BIRTHDAY_REMOVE_SUCCESS", {user: target});
    }
};