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
    mine: "mine",
    my: "mine",
    me: "mine",
}


module.exports = {
    name: "Records Leaderboard",
    usage: "records mine/all/monthly/weekly/yearly",
    commands: ["records", "rlb", "record"],
    run: async function (message, args, bot) {
        const timescale = args[2] ? timescales[args[2].toLowerCase()] : "all";

        if (!timescale)
            return message.channel.send(`:bangbang: The available records leaderboards are: **all, year, month, week** Alternatively, see a list of your own records with 'mine', for example: **${args[0]} records mine**`);


        try {
            if (timescale !== "mine") {
                message.channel.startTyping();
                let span = bot.util.startSpan("Get Translation Key");
                const unknownUserKey = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "TRIVIA_UNKNOWN_USER");
                span.end();
                span = bot.util.startSpan("Get Leaderboard");
                let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${timescale}`);
                span.end();
                if (!leaderboard.data || leaderboard.data.length === 0) {
                    return message.channel.send(`There is no data for that timeframe. Try **${args[0]} records all** to see the all time scores.`);
                }
                span = bot.util.startSpan("Get Position");
                let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${timescale}/${message.author.id}`);
                span.end();
                let outputData = [];

                span = bot.util.startSpan("Create Table");
                for (let i = 0; i < leaderboard.data.length; i++) {
                    const entry = leaderboard.data[i]
                    let user;
                    try {
                        user = await bot.util.getUserInfo(entry.user);
                    } catch (e) {
                    }
                    outputData.push({
                        "#": i + 1,
                        "user": user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                        "Total": entry.total.toLocaleString(),
                    });
                }
                span.end();
                message.reply(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total record holders${timescale === "all" ? " of all time" : ` this ${timescale}`}.\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
            } else {
                let targetUser = message.author.id;
                let span = bot.util.startSpan("Get Records");
                let records = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${targetUser}/list?items=500`);
                span.end();
                if (records.data.length === 0) {
                    return message.channel.send(":stopwatch: You have no records!");
                }
                const pages = records.data.chunk(20);
                await bot.util.standardPagination(message.channel, pages, async function (records, index) {
                    let output = "```autohotkey\n";
                    let rows = [];
                    for (let i = 0; i < records.length; i++) {
                        const record = records[i];
                        rows.push({
                            date: new Date(record.timestamp).toDateString(),
                            ":: song": ":: " + record.song,
                            seconds: (record.time < 10000 ? "0" : "") + (record.time / 1000).toFixed(3)
                        })
                    }
                    output += `\n${columnify(rows)}\n`
                    output += `Page ${index + 1}/${pages.length}\n\`\`\``;
                    return output
                })
            }
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            message.replyLang("GENERIC_ERROR");
        } finally {
            message.channel.stopTyping(true);
        }

    }
};