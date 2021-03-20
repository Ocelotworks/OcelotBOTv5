module.exports = {
    type: "playAudio",
    run: async function(message, response, bot){
        if (!message.member.voice.channel) {
            message.replyLang("VOICE_NO_CHANNEL");
        } else if (message.member.voice.channel.full) {
            message.replyLang("VOICE_FULL_CHANNEL");
        } else if (!message.member.voice.channel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        } else if (!message.member.voice.channel.speakable) {
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        } else if (await bot.database.hasActiveSession(message.guild.id)) {
            message.channel.send(`The bot is currently playing music. Please wait for the queue or type ${message.getSetting("prefix")}music stop to end to use this command.`);
        }

        return bot.lavaqueue.playOneSong(message.member.voice.channel, response.content);
    }
}