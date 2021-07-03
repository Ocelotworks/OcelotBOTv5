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
    run: async function (context, bot) {
        const guild = context.guild.id;
        await bot.lavaqueue.manager.leave(guild);
        await bot.music.deconstructListener(guild);

        if (!bot.music.listeners[guild])
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        //if(listener.playing && listener.voiceChannel.members.size > 2)
        //   return context.send(`:bangbang: You can only use this command if you're the only one listening.`);

        return context.send(":wave: Goodbye.");
    }
};