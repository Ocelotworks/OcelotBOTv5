const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Set Reminder",
    usage: "in :timeandmessage+",
    commands: ["in", "on", "at", "for", "the", "me"],
    slashOptions: [{
        type: "STRING", name: "timeandmessage", description: "The time your reminder is at and the message", required: true
    }],
    run: async function (context, bot) {
        // TODO: someday ill fix this
        const input = `${context.options.command} ${context.options.timeandmessage}`
        const now = new Date();
        const rargs = regex.exec(input);
        const chronoParse = (chrono.parse(input, now, {forwardDate: true}))[0];
        let at = null;
        if (chronoParse?.start)
            at = chronoParse.start.date();


        let reminder = null;
        if (!rargs || rargs.length < 3) {
            if (!chronoParse?.text)
                return context.sendLang({content: "REMIND_INVALID_MESSAGE", ephemeral: true});

            const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
            if (!guessedContent)
                return context.sendLang({content: "REMIND_INVALID_MESSAGE", ephemeral: true});
            reminder = guessedContent;
        } else
            reminder = rargs[2];

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

