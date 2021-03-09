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
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if (!music.listeners[guild])
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];
        if (listener.playing && listener.voiceChannel.members.size > 2 && listener.playing.requester !== message.author.id)
            return message.channel.send(`:bangbang: You can only use this command if you're the only one listening or it is your track playing.`);


        listener.connection.pause(false);
        message.channel.send("▶ Resumed.");
    }
};