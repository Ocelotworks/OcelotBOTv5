/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/05/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
module.exports = {
    name: "Add Sub",
    usage: "add :subcommand :data?+",
    commands: ["add",  "new"],
    run:  async function(context, bot){
        if(!bot.subscriptions[context.options.subcommand])
            return context.sendLang({
                content: "SUBSCRIPTION_INVALID_TYPE",
                ephemeral: true,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "types"))]
            });
            let content = context.options.data || context.options;
            let validation = await bot.subscriptions[context.options.subcommand].validate(content, context);
            if(validation.error)
                return context.send({content: validation.error, ephemeral: true});
            let res = await bot.database.addSubscription(context.guild.id, context.channel.id, context.user.id, context.options.subcommand, validation.data, bot.client.user.id);
            let subObject = {
                server: context.guild.id,
                channel: context.channel.id,
                user: context.user.id,
                type: context.options.subcommand,
                data: validation.data,
                lastcheck: new Date().getTime(),
                id: res[0]
            };
            if(!context.commandData.subs[subObject.data])
                context.commandData.subs[subObject.data] = [];

            context.commandData.subs[subObject.data].push(subObject);
            if(bot.subscriptions[context.options.subcommand].added)
                bot.subscriptions[context.options.subcommand].added(subObject, bot);

            return context.sendLang({content: "SUBSCRIPTION_SUCCESS"}, {id: res[0], message: validation.success || ""});
    }
};