/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) giveBadge
 *  ════╝
 */
module.exports = {
    name: "Give Badge",
    usage: "giveBadge :@user :0id",
    commands: ["givebadge"],
    run: async function (context, bot) {
        let user = await bot.client.users.fetch(context.options.user);
        bot.badges.giveBadge(user, context.channel, context.options.id);
    }
};