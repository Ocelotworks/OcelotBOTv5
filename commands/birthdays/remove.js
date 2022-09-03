/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/10/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Remove Birthday",
    usage: "remove :usertoremove?+",
    commands: ["remove", "delete"],
    argDescriptions: {
        usertoremove: {name: "The users birthday to remove, if not your own"},
    },
    run: async function (context, bot) {
        let target = context.user;
        const mention = Strings.GetUserFromMention(bot, context.options.usertoremove);
        if (context.channel.permissionsFor(context.user.id).has("MANAGE_CHANNELS")) {
            console.log("User: ",context.options);
            console.log("Mention:",mention);
            if(mention){
                target = mention;
            } else if (context.options.usertoremove) {
                let allBirthdays = await bot.database.getBirthdays(context.guild.id);
                let found = false;
                const search = context.options.usertoremove;
                for (let i = 0; i < allBirthdays.length; i++) {
                    if(search === allBirthdays[i].user){
                        found = true;
                        // This is wrong
                        target = {id: allBirthdays[i].user, toString(){return `<@${this.id}>`}};
                        break;
                    }
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
        } else if (context.options.usertoremove && (!mention || mention.id !== context.user.id)) {
            return context.replyLang("BIRTHDAY_REMOVE_PERMISSION");
        }
        await bot.database.removeBirthday(target.id, context.guild.id);
        return context.replyLang("BIRTHDAY_REMOVE_SUCCESS", {user: target});
    }
};