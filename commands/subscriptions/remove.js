/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 6/05/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Sub",
    usage: "remove",
    commands: ["remove", "delete"],
    run:  async function(context, bot, data){
        if(!args[2] || isNaN(args[2])){
            message.channel.send(`:bangbang: Usage !subscriptions remove **ID**. You can get the ID from ${context.command} list`);
        }else{
            const removed = await bot.database.removeSubscription(message.guild.id, message.channel.id, args[2]);
            if(removed === 0)
                return message.channel.send(`:bangbang: That subscription could not be found. The ID can be found at ${context.command} list`);

            data.removedSubs.push(args[2]);
            message.channel.send(":white_check_mark: Subscription removed!");

        }
    }
};