const columnify = require('columnify');
const Sentry = require('@sentry/node');

const timescales = {
    monthly: "month",
    yearly: "year",
    weekly: "week",
    all: "all",
}

module.exports = {
    name: "Leaderboards",
    usage: "leaderboard [timescale?:all,monthly,weekly,yearly]",
    commands: ["leaderboard", "lb"],
    run: async function (context, bot) {
        const timescale = timescales[context.options.timescale] || "month";
        
        context.defer();
        try {
            let span = bot.util.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/points/${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return context.send({content:`There is no data for this timeframe yet. Try **${context.command} leaderboard all** to see the all time scores.`, ephemeral: true});
            }
            span = bot.util.startSpan("Get Position");
            let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/points/${timescale}/${context.user.id}`);
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

            let output = `You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total users${timescale === "all" ? " of all time" : ` this ${timescale}`}.\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``;
            if(timescale !== "all")output += `**${context.getSetting("prefix")}points leaderboard all** to see all-time scores.`
            return context.reply(output);
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }
};