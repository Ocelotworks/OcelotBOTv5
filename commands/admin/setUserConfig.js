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
        if(user.length > 36)
            return context.send(`User ID must be less than 36 characters`);
        const key = context.options.key;
        if(key.length > 255)
            return context.send(`Config keys are limited to 255 characters`);
        const value = context.options.value;
        if(value?.length > 2048)
            return context.send(`Config values are limited to 2048 characters`);
        await bot.database.setUserSetting(user, key, value);
        bot.rabbit.event({type: "reloadUserConfig"});
        if(!context.options.value)
            return context.send(`Cleared value \`${key}\` for ${user}`);
        return context.send(`Set \`${key} = '${value}'\` for ${user}`);
    }
};