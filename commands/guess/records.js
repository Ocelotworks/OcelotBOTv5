const columnify = require('columnify');
const Sentry = require('@sentry/node');
const Util = require("../../util/Util");
const Strings = require("../../util/String");

module.exports = {
    name: "Records Leaderboard",
    usage: "records [timescale?:mine,all,monthly,weekly,yearly]",
    commands: ["records", "rlb", "record"],
    run: async function (context, bot) {
        const timescale = context.options.timescale || "all";

        await context.defer();
        try {
            if (timescale !== "mine") {

                //let span = bot.util.startSpan("Get Translation Key");
                const unknownUserKey = context.getLang("TRIVIA_UNKNOWN_USER");
                //span.end();
                //span = bot.util.startSpan("Get Leaderboard");
                let leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${timescale}`);
                //span.end();
                if (!leaderboard.data || leaderboard.data.length === 0) {
                    return message.channel.send(`There is no data for that timeframe. Try **${context.command} records all** to see the all time scores.`);
                }
                //span = bot.util.startSpan("Get Position");
                let positionData = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${timescale}/${context.user.id}`);
                //span.end();
                let outputData = [];

                //span = bot.util.startSpan("Create Table");
                for (let i = 0; i < leaderboard.data.length; i++) {
                    const entry = leaderboard.data[i]
                    let user;
                    try {
                        user = await bot.util.getUserInfo(entry.user);
                    } catch (e) {
                    }
                    outputData.push({
                        "#": i + 1,
                        user: user ? `${user.username}#${user.discriminator}`.yellow : `${unknownUserKey} ${entry.user}`.black,
                        total: entry.total.toLocaleString(),
                    });
                }
                //span.end();
                context.reply(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total record holders${timescale === "all" ? " of all time" : ` this ${timescale}`}.\n${Strings.Columnify(outputData)}`);
            } else {
                let targetUser = context.user.id;
                //let span = bot.util.startSpan("Get Records");
                let records = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/guess/records/${targetUser}/list?items=500`);
                //span.end();
                if (records.data.length === 0)
                    return context.send({content: ":stopwatch: You have no records!", ephemeral: true});

                const pages = records.data.chunk(10);
                return Util.StandardPagination(bot, context, pages, async function (records, index) {
                    let rows = [];
                    for (let i = 0; i < records.length; i++) {
                        const record = records[i];
                        rows.push({
                            date: new Date(record.timestamp).toDateString(),
                            song: record.song.yellow,
                            seconds: (record.time < 10000 ? "0" : "") + (record.time / 1000).toFixed(3)
                        })
                    }
                    return {content: Strings.Columnify(rows, "", `\nPage ${index + 1}/${pages.length}`.white)}
                })
            }
        } catch (e) {
            bot.logger.log(e);
            Sentry.captureException(e);
            context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
        }

    }
};