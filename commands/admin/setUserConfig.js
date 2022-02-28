/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) setUserConfig
 *  ════╝
 */
module.exports = {
    name: "Set User Config Key",
    usage: "setuserconfig :user :key :value+?",
    commands: ["setuserconfig", "suc", "succ"],
    run: async function (context, bot) {
        const user = context.options.user === "me" ? context.user.id : context.options.user;
        const key = context.options.key;
        const value = context.options.value;
        await bot.database.setUserSetting(user, key, value);
        bot.rabbit.event({type: "reloadUserConfig"});
        if(!context.options.value)
            return context.send(`Cleared value \`${key}\` for ${user}`);
        return context.send(`Set \`${key} = '${value}'\` for ${user}`);
    }
};