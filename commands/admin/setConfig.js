/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 07/12/2018
 * ╚════ ║   (ocelotbotv5) setConfig
 *  ════╝
 */

module.exports = {
    name: "Set Config Key",
    usage: "setconfig :server :key :value?+",
    commands: ["setconfig", "sc"],
    run: async function (context, bot) {
        const server = context.options.server === "this" ? context.guild.id : context.options.server;
        if(server.length > 36)
            return context.send(`Server ID must be less than 36 characters`);
        const key = context.options.key;
        if(key.length > 512)
            return context.send(`Config keys are limited to 512 characters`);
        const value = context.options.value;
        if(value.length > 2000)
            return context.send(`Config values are limited to 2000 characters`);
        await bot.database.setSetting(server, key, value, bot.client.user.id);
        bot.rabbit.event({type: "reloadConfig", payload: {guild: server, settings: [key]}});
        if(!context.options.value)
            return context.send(`Cleared value \`${key}\` for ${server}`);
        return context.send(`Set \`${key} = '${value}'\` for ${server}`);
    }
};