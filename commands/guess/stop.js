module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run: async function (context, bot, runningGames) {
        if (context.member.voice.channel && runningGames[context.guild.id]) {
            await runningGames[context.guild.id].end();
        } else {
            context.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}