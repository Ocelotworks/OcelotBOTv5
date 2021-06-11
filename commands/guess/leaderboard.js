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
    usage: "leaderboard all/monthly/weekly/yearly server",
    commands: ["leaderboard", "lb"],
    run: async function (message, args, bot) {

        let server = "global";

        if (!args[2] || args[2].toLowerCase() === "server") {
            if (args[2] && args[2].toLowerCase() === "server")
                args[3] = "server";
            args[2] = "all";
        }

        if (args[3] && args[3].toLowerCase() === "server" && message.guild)
            server = message.guild.id;

        const timescale = timescales[args[2].toLowerCase()];

        if (!timescale)
            return message.channel.send(`:bangbang: The available leaderboards are: **all, year, month and week** Add **server** to see the leaderboard for this server, for example: **${args[0]} leaderboard year server**`);

        message.channel.startTyping();
        try {
            let span = bot.util.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/${server}/${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return message.channel.send(`There is no data for that timeframe. Try **${args[0]} leaderboard all** to see the all time scores.`);
            }
            span = bot.util.startSpan("Get Position");
            let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/${server}/${timescale}/${message.author.id}`);
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

            message.channel.send(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total ? positionData.total.toLocaleString() : "???"}** total players${timescale === "all" ? " of all time" : ` this ${timescale}`}${server === "global" ? "." : " in this server."}\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            message.replyLang("GENERIC_ERROR");
        } finally {
            message.channel.stopTyping(true);
        }
    }
};