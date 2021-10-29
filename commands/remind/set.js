const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Set Reminder",
    usage: "in :timeandmessage+",
    commands: ["in", "on", "at", "for", "the", "me"],
    run: async function (context, bot) {
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
                return context.sendLang("REMIND_INVALID_MESSAGE");

            const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
            if (!guessedContent)
                return context.sendLang("REMIND_INVALID_MESSAGE");
            reminder = guessedContent;
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
            context.sendLang("REMIND_ERROR");
            bot.raven.captureException(e);
        }
    }
}

