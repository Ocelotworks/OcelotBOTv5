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
    run:  async function(context, bot){
        const subs = await bot.database.getSubscriptionsForChannel(context.channel.id, bot.client.user.id);
        if(subs.length > 0){
            let output = `Active subscriptions for **#${context.channel.name}**:\n\`\`\`\n`;
            output += columnify(subs.map(({id, type, data})=>({id, type, data})));
            output += `\n\`\`\`\nTo remove a subscription, type **${context.command} remove id**`;
            return context.send(output);
        }else{
            return context.sendLang({content: "SUBSCRIPTION_NONE", ephemeral: true});
        }
    }
};