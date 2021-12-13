module.exports = {
    name: "Manage Poll",
    usage: "manage :0id",
    commands: ["manage"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        return context.send({
            content: "Manage your poll",
            ephemeral: true,
            components: [
                bot.util.actionRow(
                    button(bot, context, "pause", id, poll.paused ? "Resume Entries" : "Pause Entries"),
                    button(bot, context, "end", id, "End Poll", 4),
                ),
                bot.util.actionRow(
                    button(bot, context, "multiple", id, "Allow Multiple", 3, poll.multiple),
                    button(bot, context, "reset", id, "Reset Votes", 4),
                   //button(bot, context, "votes", id, "Show Votes", 1),
                ),
                // bot.util.actionRow(
                //     button(bot, context, "edit title", id, "Edit Title"),
                //     button(bot, context, "edit expiry", id, "Edit Expiry"),
                // ),
                // bot.util.actionRow(
                //     button(bot, context, "add", id, "Add Option", 3),
                //     button(bot, context, "remove", id, "Remove Option", 4),
                // )
            ]
        });
    }
};

function button(bot, context, command, id, label, style = 2, disabled = false){
    let button = bot.interactions.suggestedCommand(context, `${command} ${id}`, {oneShot: false});
    button.label = label;
    button.style = style;
    button.disabled = disabled;
    return button;
}