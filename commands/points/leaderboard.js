const columnify = require('columnify');
const Sentry = require('@sentry/node');

module.exports = {
    name: "Leaderboards",
    usage: "leaderboard [timescale?:all,monthly,weekly,yearly]",
    commands: ["leaderboard", "lb"],
    run: async function (context, bot) {
        const timescale = context.options.timescale || "all";
        
        context.defer();
        try {
            let span = bot.util.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/points/${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return context.send({content:`There is no data for that timeframe. Try **${context.command} leaderboard all** to see the all time scores.`, ephemeral: true});
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

            return context.reply(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total users${timescale === "all" ? " of all time" : ` this ${timescale}`}.\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }
};