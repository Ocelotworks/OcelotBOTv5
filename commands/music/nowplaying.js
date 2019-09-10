/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/06/2019
 * ╚════ ║   (ocelotbotv5) nowplaying
 *  ════╝
 */
module.exports = {
    name: "Now Playing",
    usage: "nowplaying",
    commands: ["nowplaying", "np", "playing"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if(!music.listeners[guild] || !music.listeners[guild].playing)
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];

        // if(!listener.connection.playing) {
        //     bot.logger.warn("Caught an uh-oh");
        //     return music.playNextInQueue(guild);
        // }

        listener.lastMessage = await message.channel.send(music.createNowPlayingEmbed(listener));
        await bot.database.updateLastMessage(listener.id, listener.lastMessage.id);
    }
};