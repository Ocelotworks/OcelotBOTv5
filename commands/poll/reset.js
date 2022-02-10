module.exports = {
    name: "Reset Poll",
    usage: "reset :0id",
    commands: ["reset", "clear"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;

        await bot.database.deletePollAnswers(id);

        await context.commandData.renderPollAnswers(bot, message, poll, context);

        message.edit({embeds: message.embeds});

        return context.editLang({content: "POLL_RESET_SUCCESS", ephemeral: true});
    }
};
