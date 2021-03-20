module.exports = {
    type: "playAudio",
    run: async function(message, response, bot){
        if (!message.member.voice.channel)
            return message.replyLang("VOICE_NO_CHANNEL");
        if (message.member.voice.channel.full)
            return message.replyLang("VOICE_FULL_CHANNEL");
        if (!message.member.voice.channel.joinable)
            return message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        if (!message.member.voice.channel.speakable)
            return message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        if (await bot.database.hasActiveSession(message.guild.id))
            return message.channel.send(`The bot is currently playing music. Please wait for the queue or type ${message.getSetting("prefix")}music stop to end to use this command.`);
        return bot.lavaqueue.playOneSong(message.member.voice.channel, response.content);
    }
}