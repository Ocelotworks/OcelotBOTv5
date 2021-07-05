/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 6/05/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Sub",
    usage: "remove :0id",
    commands: ["remove", "delete"],
    run:  async function(context, bot){
        const removed = await bot.database.removeSubscription(context.guild.id, context.channel.id, context.options.id);
        if(removed === 0)
            return context.sendLang({content: "SUBSCRIPTION_NOT_FOUND", ephemeral: true});
        context.commandData.removedSubs.push(context.options.id);
        return context.sendLang({content: "SUBSCRIPTION_REMOVED"});
    }
};