/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) seek
 *  ════╝
 */
module.exports = {
    name: "Seek Song",
    usage: "seek <seconds>",
    commands: ["seek"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if (!music.listeners[guild])
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];
        if(listener.playing && listener.voiceChannel.members.size > 2 && listener.playing.requester !== message.author.id)
            return message.channel.send(`:bangbang: You can only use this command if you're the only one listening or it is your track playing.`);

        if(!args[2] || isNaN(args[2])) {
            console.log(args[2]);
            return message.channel.send(":bangbang: Enter a position to seek to in seconds, or relative e.g +10 or -10");
        }

        let position = args[2];
        if(args[2].startsWith("+") || args[2].startsWith("-"))
            position = (listener.connection.state.position/1000)+(parseInt(args[2]));

        if(position*1000 > listener.playing.info.length)
            return message.channel.send(`:warning: That would seek past the end of the song. To skip, type ${args[0]} skip`);

        listener.connection.seek(position*1000);
        message.channel.send(`Seeked to **${bot.util.shortSeconds(position)}**`);
    }
};