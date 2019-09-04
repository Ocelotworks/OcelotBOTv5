/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) leave
 *  ════╝
 */
module.exports = {
    name: "Leave channel",
    usage: "leave",
    commands: ["leave", "quit"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if (!music.listeners[guild] || !music.listeners[guild].playing)
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];


        if(listener.playing && listener.voiceChannel.members.size > 2)
            return message.channel.send(`:bangbang: You can only use this command if you're the only one listening.`);

        message.channel.send(":wave: Goodbye.");
        await listener.connection.disconnect();
        music.deconstructListener(guild);
    }
};