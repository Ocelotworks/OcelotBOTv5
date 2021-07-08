/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) resume
 *  ════╝
 */
module.exports = {
    name: "Resume Song",
    usage: "resume",
    commands: ["resume", "unpause"],
    run: async function (context, bot) {
        const guild = context.guild.id;
        if (!bot.music.listeners[guild])
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];
        if (listener.playing && listener.voiceChannel.members.size > 2 && listener.playing.requester !== context.user.id)
            return context.send(`:bangbang: You can only use this command if you're the only one listening or it is your track playing.`);


        listener.connection.pause(false);
        context.send("▶ Resumed.");
    }
};