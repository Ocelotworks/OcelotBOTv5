module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run: async function (context, bot) {
        if (context.member.voice.channel && context.commandData.runningGames[context.guild.id]) {
            await context.commandData.runningGames[context.guild.id].end();
        } else {
            context.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}