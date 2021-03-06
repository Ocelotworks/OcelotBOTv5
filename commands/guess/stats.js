module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run: async function (message, args, bot, runningGames) {
        message.channel.startTyping();
        try {
            let span = bot.util.startSpan("Get guess stats");
            let stats = await bot.database.getGuessStats();
            span.end();

            stats.totalCorrectPercent = Math.round((stats.totalCorrect / stats.totalGuesses) * 100);
            stats.averageTimeParsed = bot.util.prettySeconds(stats.averageTime / 1000, message.guild && message.guild.id, message.author.id);
            stats.totalTimeParsed = bot.util.prettySeconds(stats.totalTime / 1000, message.guild && message.guild.id, message.author.id);
            message.replyLang("SONGGUESS_STATS", stats)
        } catch (e) {
            bot.raven.captureException(e);
        } finally {
            message.channel.stopTyping(true);
        }
    }
}