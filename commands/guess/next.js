module.exports = {
    name: "Skip Song",
    usage: "skip",
    commands: ["skip", "next"],
    run: async function (message, args, bot, runningGames) {
        if (message.member.voice.channel && runningGames[message.guild.id] && runningGames[message.guild.id].collector) {
            await runningGames[message.guild.id].collector.stop();
        } else {
            message.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}