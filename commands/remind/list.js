const columnify = require('columnify');
const Util = require("../../util/Util");
module.exports = {
    name: "List Reminders",
    usage: "list",
    commands: ["list", "view", "mine"],
    run: async function (context, bot) {
        let reminders = await bot.database.getRemindersForUser(bot.client.user.id, context.user.id,context.guild?.id || null);
        if (reminders.length === 0)
            return context.send(`You have not got any currently active reminders! To see how to set a reminder, type ${context.command} help`);

        let header = `To remove a reminder, type ${context.command} remove id\n\`\`\`yaml\n`
        let chunkedReminders = reminders.chunk(5);
        return Util.StandardPagination(bot, context, chunkedReminders, async function (reminders, index) {
            let formatted = [];
            for (let i = 0; i < reminders.length; i++) {
                let reminder = reminders[i];
                let channel = await bot.util.getChannelInfo(reminder.channel);
                formatted.push({
                    "id :: ": reminder.id + " ::",
                    channel: channel ? channel.name : "unknown",
                    set: reminder.timestamp.toLocaleString(),
                    due: reminder.recurrence ? "recurring" : reminder.at.toLocaleString(),
                    message: reminder.message.substring(0, 100),
                });
            }
            return header + columnify(formatted) + "\n```";
        });
    }
};