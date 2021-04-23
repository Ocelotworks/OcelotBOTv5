module.exports = {
    type: "webhook",
    run: async function(message, response, bot){
        const webhooks = await message.channel.fetchWebhooks();
        let webhook;
        if(webhooks.size < 1){
            webhook = await message.channel.createWebhook(bot.client.user.username, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}));
        }else{
            webhook = webhooks.first();
        }

        return webhook.send(response.content, {
            username: response.displayName,
            avatarURL: response.avatar,
            disableEveryone: true
        });
    }
}