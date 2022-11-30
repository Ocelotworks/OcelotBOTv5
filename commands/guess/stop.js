module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run: async function (context, bot) {
        if (context.member.voice.channel && context.commandData.runningGames[context.guild.id]) {
            context.commandData.runningGames[context.guild.id].context = context;
            await context.commandData.runningGames[context.guild.id].end(context);
        } else {
            context.replyLang("SONGGUESS_NOT_PLAYING");
        }
    }
}