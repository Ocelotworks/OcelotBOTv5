module.exports = {
    type: "playAudio",
    run: async function(context, response, bot){
        if (!context.member.voice.channel)
            return context.replyLang("VOICE_NO_CHANNEL");
        if (context.member.voice.channel.full)
            return context.replyLang("VOICE_FULL_CHANNEL");
        if (!context.member.voice.channel.joinable)
            return context.replyLang("VOICE_UNJOINABLE_CHANNEL");
        if (!context.member.voice.channel.speakable)
            return context.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        if (await bot.database.hasActiveSession(context.guild.id))
            return context.channel.send(`The bot is currently playing music. Please wait for the queue or type ${context.getSetting("prefix")}music stop to end to use this command.`);
        let {player} = await bot.lavaqueue.playOneSong(context.member.voice.channel, response.content);
        if(!player)return context.channel.send("No lavalink node is currently available. Try again later.");
        return player;
    }
}