module.exports = {
    name: "End Poll",
    usage: "end :0id",
    commands: ["end"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        await Promise.all([context.commandData.expirePoll(bot, poll), bot.database.deletePoll(context.guild.id, id)]);

        return context.edit({content: "Poll Ended.", components: []}); // TODO: maybe print out final readings here?
    }
};
