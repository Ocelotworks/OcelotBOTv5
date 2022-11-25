module.exports = {
    name: "Stats",
    usage: "stats",
    commands: ["stats"],
    run: async function (context, bot) {
        context.defer();
        try {
            //let span = bot.util.startSpan("Get guess stats");
            let stats = await bot.database.getGuessStats();
            //span.end();

            stats.totalCorrectPercent = Math.round((stats.totalCorrect / stats.totalGuesses) * 100);
            stats.averageTimeParsed = bot.util.prettySeconds(stats.averageTime / 1000, context.guild && context.guild.id, context.user.id);
            stats.totalTimeParsed = bot.util.prettySeconds(stats.totalTime / 1000, context.guild && context.guild.id, context.user.id);
            return context.replyLang("SONGGUESS_STATS", stats)
        } catch (e) {
            bot.raven.captureException(e);
        }
    }
}