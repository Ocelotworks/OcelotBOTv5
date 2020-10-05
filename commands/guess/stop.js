module.exports = {
    name: "Stop Guessing",
    usage: "stop",
    commands: ["stop", "end"],
    run:  async function (message, args, bot, runningGames) {
        if (message.member.voice.channel && runningGames[message.member.voice.channel.id]) {
            await runningGames[message.member.voice.channel.id].collector.stop();
        }else{
            message.channel.send(":warning: You are not currently in a voice channel that is playing guess!");
        }
    }
}