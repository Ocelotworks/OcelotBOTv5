module.exports = {
    name: "Skip Song",
    usage: "skip",
    commands: ["skip", "next"],
    run: async function (context, bot, runningGames) {
        if (context.member.voice.channel && runningGames[context.guild.id] && runningGames[context.guild.id].collector) {
            await runningGames[message.guild.id].collector.stop();
        } else {
            context.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}