/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/06/2019
 * ╚════ ║   (ocelotbotv5) nowplaying
 *  ════╝
 */
module.exports = {
    name: "Now Playing",
    usage: "nowplaying <url>",
    commands: ["nowplaying", "np", "playing"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if(!music.listeners[guild] || !music.listeners[guild].playing)
            return message.channel.send(`:warning: Nothing is currently playing! To play a song, type ${args[0]} queue <search or URL>`);

        const listener = music.listeners[guild];
        message.channel.send(music.createNowPlayingEmbed(listener));
    }
};