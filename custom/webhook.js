module.exports = {
    type: "webhook",
    run: async function(message, response, bot){
        const webhooks = await message.channel.fetchWebhooks();
        let webhook = webhooks.filter((w)=>w.type === "Incoming").first();
        if(!webhook){
            webhook = await message.channel.createWebhook(bot.client.user.username, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}));
        }

        return webhook.send(response.content, {
            username: response.displayName,
            avatarURL: response.avatar,
            disableEveryone: true
        });
    }
}