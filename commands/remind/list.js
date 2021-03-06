const columnify = require('columnify');
module.exports = {
    name: "List Reminders",
    usage: "list",
    commands: ["list", "view", "mine"],
    run: async function (message, args, bot) {
        let reminders = await bot.database.getRemindersForUser(bot.client.user.id, message.author.id, message.guild ? message.guild.id : null);
        if (reminders.length === 0)
            return message.channel.send(`You have not got any currently active reminders! To see how to set a reminder, type ${args[0]} help`);

        let header = `To remove a reminder, type ${args[0]} remove id\n\`\`\`yaml\n`
        let chunkedReminders = reminders.chunk(5);
        return bot.util.standardPagination(message.channel, chunkedReminders, async function (reminders, index) {
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