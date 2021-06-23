const columnify = require('columnify');
const Sentry = require('@sentry/node');
const timescales = {
    all: "all",
    month: "month",
    monthly: "month",
    week: "week",
    weekly: "week",
    year: "year",
    yearly: "year",
}
module.exports = {
    name: "Leaderboards",
    usage: "leaderboard all/monthly/weekly/yearly",
    commands: ["leaderboard", "lb"],
    run: async function (message, args, bot) {
        const timescale = args[2] ? timescales[args[2].toLowerCase()] : "all";

        if (!timescale)
            return message.channel.send(`:bangbang: The available leaderboards are: **all, year, month and week**.`);

        message.channel.startTyping();
        try {
            let span = bot.util.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/points//${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return message.channel.send(`There is no data for that timeframe. Try **${context.command} leaderboard all** to see the all time scores.`);
            }
            span = bot.util.startSpan("Get Position");
            let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/points/${timescale}/${message.author.id}`);
            span.end();
            let outputData = [];

            span = bot.util.startSpan("Create Table");
            for (let i = 0; i < leaderboard.data.length; i++) {
                const entry = leaderboard.data[i]
                outputData.push({
                    "#": i + 1,
                    "user": await bot.util.getUserTag(entry.user),
                    [timescale === "all" ? "balance" : "earned"]: parseInt(entry.points).toLocaleString(),
                });
            }
            span.end();

            message.channel.send(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total users${timescale === "all" ? " of all time" : ` this ${timescale}`}.\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            message.replyLang("GENERIC_ERROR");
        } finally {
            message.channel.stopTyping(true);
        }
    }
};