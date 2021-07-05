/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/05/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
const Embeds = require("../../util/Embeds");
module.exports = {
    name: "View Types",
    usage: "view :type?",
    commands: ["view"],
    run:  async function(context, bot, data){
        if(!context.options.type) {
            let subs = "";
            for (let sub in bot.subscriptions) {
                if (!bot.subscriptions.hasOwnProperty(sub)) continue;
                if(bot.subscriptions[sub].hidden)continue;
                subs += sub + " :: " + bot.subscriptions[sub].name + "\n";
            }

            let output = `\`\`\`asciidoc
To get additional help, type ${context.getSetting("prefix")}${context.command} view id
Available Subscriptions
============
ID :: Name
-
${subs}
\`\`\``;

            return context.send(output);
        }
        if(!bot.subscriptions[context.options.type])
            return context.sendLang({content: "SUBSCRIPTION_INVALID_TYPE", ephemeral: true});

        const subscription = bot.subscriptions[context.options.type];
        const embed = new Embeds.AuthorEmbed(context);
        embed.setTitle(`${subscription.id}: ${subscription.name}`);
        if(subscription.help)
            embed.setDescription(subscription.help);
        else
            embed.setDescriptionLang("SUBSCRIPTION_HELP_DESCRIPTION", subscription);
        return context.send({embeds: [embed]});
    }
};