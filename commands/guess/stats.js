


module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run:  async function (message, args, bot, runningGames) {
        message.channel.startTyping();
        try {
            let span = bot.apm.startSpan("Get guess stats");
            let stats = await bot.database.getGuessStats();
            span.end();
            let output = "**Guess Stats:**\n";
            // output += `**${songList.length.toLocaleString()}** available songs.\n`;
            output += `**${stats.totalGuesses.toLocaleString()}** total guesses by **${stats.totalUsers.toLocaleString()}** users.\n`;
            output += `**${stats.totalCorrect.toLocaleString()}** (**${parseInt((stats.totalCorrect / stats.totalGuesses) * 100)}%**) correct guesses.\n`;
            output += `Average of **${bot.util.prettySeconds(stats.averageTime / 1000)}** until a correct guess.\n`;
            output += `**${bot.util.prettySeconds(stats.totalTime / 1000)}** spent guessing in total.\n`;
            message.channel.send(output);
        }catch(e){
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    }
}