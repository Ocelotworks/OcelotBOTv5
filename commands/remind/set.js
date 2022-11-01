const chrono = require('chrono-node');
module.exports = {
    name: "Set Reminder",
    usage: "set :time :message",
    commands: ["set"],
    argDescriptions: {
        time: {name: "The reminder time 'in 2 hours' or 'on the 31st December'"},
        message: {name: "The message to accompany your reminder"}
    },
    run: async function (context, bot) {
        if(!context.interaction)
            return context.send({content: "This command is now only available as a slash command. Please use </remind set:904885955486433292>", ephemeral: true});

        if(!context.channel)
            return context.send({content: "There was an issue with your command. Please join the support server and tell us you received this error.", ephemeral: true});
        const now = new Date();
        const chronoParse = (chrono.parse(`in ${context.options.time}`, now, {forwardDate: true}))[0];
        let at = null;
        if (chronoParse?.start)
            at = chronoParse.start.date();

        let reminder = context.options.message;

        if (!at)
            return context.sendLang({content: "REMIND_INVALID_TIME", ephemeral: true});

        if (at.getTime() >= 253370764800000)
            return context.sendLang({content: "REMIND_LONG_TIME", ephemeral: true});

        if (at.getTime() >= 2147483647000)
            return context.send({content: ":stopwatch: You can't set a reminder for on or after 19th January 2038", ephemeral: true});

        const offset = at - now;

        if (offset < 0)
            return context.send({content: ":stopwatch: The time you entered is in the past. Try being more specific or using exact dates.", ephemeral: true});
        if (offset < 1000)
            return context.sendLang({content: "REMIND_SHORT_TIME", ephemeral: true});

        if (reminder.length > 1000)
            return context.send({content: "Your reminder message cannot be longer than 1000 characters. Yours is " + reminder.length + " characters.", ephemeral: true});

        try {
            const reminderResponse = await bot.database.addReminder(bot.client.user.id, context.user.id, context.guild ? context.guild.id : null, context.channel.id, at.getTime(), reminder, context.message?.id);
            context.sendLang("REMIND_SUCCESS", {
                time: bot.util.prettySeconds((offset / 1000), context.guild && context.guild.id, context.user.id),
                date: `<t:${Math.floor(at.getTime()/1000)}:F>`,
                id: reminderResponse[0],
            });
            bot.util.setLongTimeout(async function () {
                return context.commandData.sendReminder({
                    messageID: context.message?.id,
                    receiver: bot.client.user.id,
                    channel: context.channel.id,
                    server: context.guild?.id,
                    id: reminderResponse[0],
                    user: context.user.id,
                    timestamp: now,
                    message: reminder,
                    at: at,
                }, bot);
            }, offset);
        } catch (e) {
            console.log(e);
            context.sendLang({content: "REMIND_ERROR", ephemeral: true});
            bot.raven.captureException(e);
        }
    }
}

