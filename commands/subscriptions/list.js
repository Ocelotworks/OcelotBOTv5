/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 6/05/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "List Subs",
    usage: "list",
    commands: ["list", "view"],
    run:  async function(context, bot, data){
        const subs = await bot.database.getSubscriptionsForChannel(message.channel.id);
        if(subs.length > 0){
            let output = `Active subscriptions for **#${message.channel.name}**:\n\`\`\`\n`;
            output += columnify(subs.map(({id, type, data})=>({id, type, data})));
            output += `\n\`\`\`\nTo remove a subscription, type **${context.command} remove id**`;
            message.channel.send(output);
        }else{
            message.channel.send(`There are no subscriptions in this channel yet! Add one with ${context.command} add\nor view available subscription types with **${context.command} types**`);
        }
    }
};