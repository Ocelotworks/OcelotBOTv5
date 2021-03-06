/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) leave
 *  ════╝
 */
module.exports = {
    name: "Leave Channel",
    usage: "leave",
    commands: ["leave", "quit", "stop"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        await bot.lavaqueue.manager.leave(guild);
        await music.deconstructListener(guild);

        if (!music.listeners[guild])
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        //if(listener.playing && listener.voiceChannel.members.size > 2)
        //   return message.channel.send(`:bangbang: You can only use this command if you're the only one listening.`);

        message.channel.send(":wave: Goodbye.");
    }
};