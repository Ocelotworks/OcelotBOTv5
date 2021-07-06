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
    usage: "leaderboard [timescale?:all,monthly,weekly,yearly] [server?:server]",
    commands: ["leaderboard", "lb"],
    run: async function (context, bot) {
        let server = context.options.server || "global";

        const timescale = context.options.timescale || "all";

        context.defer();
        try {
            let span = bot.util.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/${server}/${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return context.send(`There is no data for that timeframe. Try **${context.command} leaderboard all** to see the all time scores.`);
            }
            span = bot.util.startSpan("Get Position");
            let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/${server}/${timescale}/${context.user.id}`);
            span.end();
            let outputData = [];

            span = bot.util.startSpan("Create Table");
            for (let i = 0; i < leaderboard.data.length; i++) {
                const entry = leaderboard.data[i]
                outputData.push({
                    "#": i + 1,
                    "user": await bot.util.getUserTag(entry.user),
                    "Correct": entry.points.toLocaleString(),
                    "Total": entry.total.toLocaleString(),
                });
            }
            span.end();
            return context.send(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total ? positionData.total.toLocaleString() : "???"}** total players${timescale === "all" ? " of all time" : ` this ${timescale}`}${server === "global" ? "." : " in this server."}\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            context.replyLang("GENERIC_ERROR");
        }
    }
};