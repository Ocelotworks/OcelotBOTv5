const Discord = require("discord.js");

class AudioContext {

    bot;
    context;
    voiceChannel;
    textChannel;

    player;


    constructor(bot, context, voiceChannel) {
        this.bot = bot;
        this.context = context;
        this.voiceChannel = voiceChannel;
        this.textChannel = context.channel;
        if (!context.guild) return throw new Error("DM_CHANNEL");
        if (!context.guild.available) return throw new Error("UNAVAILABLE");
        if (!context.member.voice.channel) return throw new Error("NO_CHANNEL");
        if ( context.member.voice.channel.full) return throw new Error("CHANNEL_FULL");
        if (!context.member.voice.channel.joinable) return throw new Error("UNJOINABLE_CHANNEL");
        if (!context.member.voice.channel.speakable) return throw new Error("UNSPEAKABLE_CHANNEL");
        const perms = context.member.voice.channel.permissionsFor(bot.client.user.id);
        if(context.member.voice.channel instanceof Discord.StageChannel && !perms.has("REQUEST_TO_SPEAK"))return throw new Error("UNSPEAKABLE_STAGE_CHANNEL");
    }

    playImmediate(song) {
      
    }

    queue(song) {
        
    }

    queueNext(song) {
        
    }

    queueAt(song, position) {
        
    }

    togglePaused() {
        
    }

    pause() {
        
    }

    resume() {
        
    }

    stop() {
        
    };

    skip() {
        
    };

    setVolume(volume) {
        
    }

    getQueue() {
        
    }

    clearQueue(){

    }

    moveVoiceChannel(){

    }

    moveTextChannel(){

    }

    moveNode(){

    }
}


module.exports = {AudioContext};