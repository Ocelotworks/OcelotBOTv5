/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 6/05/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Remove Sub",
    usage: "remove :0id",
    commands: ["remove", "delete"],
    argDescriptions: {
        id: {name: "The subscription ID to remove", autocomplete: true}
    },
    autocomplete: async function(input, interaction, bot) {
        const subs = await bot.database.getSubscriptionsForChannel(interaction.channel.id, bot.client.user.id);
        input = input ? input.toLowerCase() : "";
        return subs.filter((s)=>s.id.toString().startsWith(input) || s.data.startsWith(input) || s.type.startsWith(input)).slice(0, 25).map((s)=>({name: Strings.Truncate(`(${s.id}) ${s.type} ${s.data}`, 100), value: s.id}))
    },

    run:  async function(context, bot){
        const removed = await bot.database.removeSubscription(context.guild.id, context.channel.id, context.options.id);
        if(removed === 0)
            return context.sendLang({
                content: "SUBSCRIPTION_NOT_FOUND",
                ephemeral: true,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
            });
        context.commandData.removedSubs.push(context.options.id);
        return context.sendLang({content: "SUBSCRIPTION_REMOVED"});
    }
};