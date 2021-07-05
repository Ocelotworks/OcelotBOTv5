module.exports = {
    name: "Remove Reminder",
    usage: "remove :0id",
    commands: ["remove", "delete", "del", "cancel"],
    run: async function (context, bot) {
        let reminder = await bot.database.getReminderById(context.options.id);
        if (!reminder[0])
            return context.send({
                content: `Couldn't find a reminder by that ID. Check the ID at **${context.command} list** and then try again.`,
                ephemeral: true,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
            });

        if (reminder[0].user !== context.user.id)
            return context.send({
                content: `That reminder doesn't belong to you. Check the ID at **${context.command} list** and then try again.`,
                ephemeral: true,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
            });

        if (reminder[0].receiver !== bot.client.user.id)
            return context.send(`That reminder doesn't belong to this bot. To prevent mistakes, please use the bot that created the reminder to remove it.`);

        if (reminder[0].server != context.guild?.id)
            return context.send(`That reminder doesn't belong to this server. To prevent mistakes, please use the server that created the reminder to remove it.`);

        // Trying to prevent another birthdays situation
        if (reminder.length > 1)
            return context.send("Something terrible happened.");

        await bot.database.removeReminderByUser(context.options.id, context.user.id);
        context.commandData.deletedReminders.push(context.options.id);
        if (context.commandData.recurringReminders[context.options.id]) {
            context.commandData.recurringReminders[context.options.id].clear();
        }
        return context.send("Successfully removed reminder " + context.options.id);
    }
};