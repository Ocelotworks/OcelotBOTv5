/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 29/04/2019
 * ╚════ ║   (ocelotbotv5) imitate
 *  ════╝
 */
module.exports = {
    name: "Imitate User",
    usage: "imitate :@user :message+",
    rateLimit: 100,
    detailedHelp: "Send a message as if you're another user",
    usageExample: "imitate @Ned Flanders I'm a big stupid four eyed lamo and I wear the same stupid sweater every day",
    responseExample: "I'm a big stupid four eyed lamo and I wear the same stupid sweater every day",
    requiredPermissions: ["MANAGE_WEBHOOKS"],
    commands: ["imitate", "imatate"],
    categories: ["fun"],
    unwholesome: true,
    slashHidden: true,
    handleError: function(context){
        if(!context.options.user)
            return context.sendLang("IMITATE_NO_USER");
        return context.sendLang("IMITATE_NO_MESSAGE");
    },
    run: async function run(context, bot) {
        if(!context.guild)
            return context.sendLang({content: "GENERIC_DM_CHANNEL", ephemeral: true});

        const target = await context.guild.members.fetch(context.options.user);
        if(!target)
            return context.sendLang({content: "IMITATE_NO_USER", ephemeral: true});


        if(context.getSetting("imitate.blockedUsers") && context.getSetting("imitate.blockedUsers").indexOf(target.id) > -1)
            return context.sendLang({content: "IMITATE_BLOCKED", ephemeral: true});

        if(target.id === bot.client.user.id)
            return context.send("https://78.media.tumblr.com/80918f5b6f4ccf8d3a82dced9ec63561/tumblr_pfg0xmvLMz1qb3quho1_500.gif");

        const webhooks = await context.channel.fetchWebhooks();
        let webhook = webhooks.filter((w)=>w.type === "Incoming" && w.token).first();
        if(!webhook){
            webhook = await context.channel.createWebhook(bot.client.user.username, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}));
        }

        if(!webhook){
            return context.send({content: "Couldn't find or create a valid webhook.", ephemeral: true});
        }

        const content = context.options.message;

        if(content.startsWith(context.getSetting("prefix")+"spook"))
            return context.replyLang({content: "IMITATE_SPOOK", ephemeral: true});

        return webhook.send({
            username: target.displayName,
            avatarURL: target.user.displayAvatarURL({dynamic: 'true'}),
            disableEveryone: true,
            content: content,
        });

    }
};