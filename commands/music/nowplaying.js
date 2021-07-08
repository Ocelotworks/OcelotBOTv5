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
    run: async function (context, bot) {
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];

        // if(!listener.connection.playing) {
        //     bot.logger.warn("Caught an uh-oh");
        //     return bot.music.playNextInQueue(guild);
        // }

        listener.lastMessage = await context.send(bot.music.createNowPlayingEmbed(listener));
        await bot.database.updateLastMessage(listener.id, listener.lastMessage.id);
    }
};