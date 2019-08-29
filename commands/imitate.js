/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 29/04/2019
 * ╚════ ║   (ocelotbotv5) imitate
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Imitate User",
    usage: "imitate <@user> <message>",
    rateLimit: 100,
    requiredPermissions: ["MANAGE_WEBHOOKS"],
    commands: ["imitate", "imatate"],
    categories: ["fun"],
    unwholesome: true,
    run: async function run(message, args, bot) {
        if(!message.guild.id)
            return message.replyLang("GENERIC_DM_CHANNEL");

        if(args.length < 3)
            return message.replyLang("IMITATE_NO_MESSAGE", {author: message.author});

        const targetUser = bot.util.getUserFromMention(args[1]);
        if(!targetUser)
            return message.replyLang("IMITATE_NO_USER");

        const target = message.guild.members.get(targetUser.id);

        if(!target)
            return message.channel.send(":thinking: That user isn't in this server...");

        if(message.getSetting("imitate.blockedUsers") && message.getSetting("imitate.blockedUsers").indexOf(target.id) > -1)
            return message.replyLang("IMITATE_BLOCKED");

        if(target.id === bot.client.user.id)
            return message.channel.send("https://78.media.tumblr.com/80918f5b6f4ccf8d3a82dced9ec63561/tumblr_pfg0xmvLMz1qb3quho1_500.gif");

        const webhooks = await message.channel.fetchWebhooks();
        let webhook;
        if(webhooks.size < 1){
            webhook = await message.channel.createWebhook("OcelotBOT", bot.client.user.avatarURL);
        }else{
            webhook = webhooks.first();
        }

        const content = message.content.substring(args[0].length+args[1].length+2);

        if(content.startsWith(message.getSetting("prefix")+"spook"))
            return message.replyLang("IMITATE_SPOOK");

        webhook.send(content, {
            username: target.displayName,
            avatarURL: target.user.displayAvatarURL,
            disableEveryone: true
        });

    }
};