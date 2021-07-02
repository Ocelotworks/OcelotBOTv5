const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Set Reminder",
    usage: "in :timeAndMessage+",
    commands: ["in", "on", "at", "for", "the", "me"],
    run: async function (context, bot) {
        const input = `${context.options.command} ${context.options.timeAndMessage}`
        const now = new Date();
        const rargs = regex.exec(input);
        const chronoParse = (chrono.parse(input, now, {forwardDate: true}))[0];
        let at = null;
        if (chronoParse && chronoParse.start)
            at = chronoParse.start.date();


        let reminder = null;
        if (!rargs || rargs.length < 3) {
            if (chronoParse && chronoParse.text) {
                const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
                if (guessedContent)
                    reminder = guessedContent;
                else
                    return context.sendLang("REMIND_INVALID_MESSAGE");
            } else
                return context.sendLang("REMIND_INVALID_MESSAGE");
        } else
            reminder = rargs[2];


        if (!at)
            return context.sendLang("REMIND_INVALID_TIME");

        if (at.getTime() >= 253370764800000)
            return context.sendLang("REMIND_LONG_TIME");

        if (at.getTime() >= 2147483647000)
            return context.send(":stopwatch: You can't set a reminder for on or after 19th January 2038");

        const offset = at - now;

        if (offset < 0)
            return context.send(":stopwatch: The time you entered is in the past. Try being more specific or using exact dates.");
        if (offset < 1000)
            return context.sendLang("REMIND_SHORT_TIME");

        if (reminder.length > 1000)
            return context.send("Your reminder message cannot be longer than 1000 characters. Yours is " + reminder.length + " characters.");

        try {
            context.sendLang("REMIND_SUCCESS", {
                time: bot.util.prettySeconds((offset / 1000), context.guild && context.guild.id, context.user.id),
                date: at.toString()
            });
            const reminderResponse = await bot.database.addReminder(bot.client.user.id, context.user.id, context.guild ? context.guild.id : null, context.channel.id, at.getTime(), reminder, context.message?.id);
            bot.util.setLongTimeout(async function () {
                try {
                    await context.sendLang("REMIND_REMINDER", {
                        username: context.user.id,
                        server: context.guild ? context.guild.id : null,
                        date: now.toString(),
                        message: reminder
                    });
                    await bot.database.removeReminder(reminderResponse[0])
                } catch (e) {
                    bot.raven.captureException(e);
                }
            }, offset);
        } catch (e) {
            console.log(e);
            context.sendLang("REMIND_ERROR");
            bot.raven.captureException(e);
        }
    }
}

