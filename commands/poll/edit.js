module.exports = {
    name: "Edit Poll",
    usage: "edit :0id",
    commands: ["edit"],
    run: async function (context, bot) {
        if(!context.interaction)return context.send("This command can only be used as a slash command");
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;

        let form = await bot.interactions.awaitForm(context, {
            "title": "Edit Poll",
            "components": [{
                "type": 1,
                "components": [{
                    "type": 4,
                    "custom_id": "title",
                    "label": "Title",
                    "style": 1,
                    "min_length": 1,
                    "max_length": 256,
                    "placeholder": "Which is better?",
                    "value": message.embeds[0].title,
                    "required": true
                }]
            }]}, 60000);


        message.embeds[0].title = form.title;

        await context.commandData.renderPollAnswers(bot, message, poll, context);

        message.edit({embeds: message.embeds});
    }
};
