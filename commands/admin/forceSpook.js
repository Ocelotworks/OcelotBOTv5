/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) reloadUserConfig
 *  ════╝
 */
module.exports = {
    name: "Force Spook",
    usage: "forcespook :server :user?",
    commands: ["forcespook", "spook"],
    run: async function (context, bot) {
        const currentSpook = await bot.database.getSpooked(context.options.server);
        if(!context.options.user){
            let result = await bot.commandObjects['spook.js'].forceNewSpook(bot, currentSpook, "ADMIN", context.member);
            return context.send(`Successfully forced a new spook.\n> ${result.content}`);
        }

        await bot.database.spook(context.options.user, context.user.id, context.options.server, currentSpook.channel, "","","","","","", "MADMIN");
        return context.send(`Successfully set spook to <@${context.options.user}> in ${context.options.server}`);
    }
};