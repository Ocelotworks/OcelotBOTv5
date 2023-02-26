/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Ban User",
    usage: "ban :user :reason?",
    commands: ["ban"],
    noCustom: true,
    slashHidden: true,
    run: async function (context, bot) {
        const target = Strings.GetUserFromMention(bot, context.options.user)?.id || context.options.user;
        if(!target){
            return context.send("Couldn't find user, try using their ID");
        }
        await bot.database.ban(target, "user", context.options.reason || "Admin ban");
        await bot.rabbit.event({type: "updateBans"});
        bot.banCache.user.push(target);
        context.send(`<@${target}> has been banned!`);
    }
};