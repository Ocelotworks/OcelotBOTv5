module.exports = {
    type: "webhook",
    run: async function(context, response, bot){
        const webhooks = await context.channel.fetchWebhooks();
        let webhook = webhooks.filter((w)=>w.type === "Incoming").first();
        if(!webhook){
            webhook = await context.channel.createWebhook(bot.client.user.username, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}));
        }

        return webhook.send(response.content, {
            username: response.displayName,
            avatarURL: response.avatar,
            disableEveryone: true
        });
    }
}