module.exports = {
    name: "Skip Song",
    usage: "skip",
    commands: ["skip", "next"],
    run: async function (context, bot) {
        if (context.member.voice.channel && context.commandData.runningGames[context.guild.id] && context.commandData.runningGames[context.guild.id].collector) {
            context.commandData.runningGames[context.guild.id].context = context;
            await context.commandData.runningGames[context.guild.id].collector.stop();
        } else {
            context.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}