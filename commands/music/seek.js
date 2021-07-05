/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) seek
 *  ════╝
 */
module.exports = {
    name: "Seek Song",
    usage: "seek :seconds",
    commands: ["seek"],
    run: async function (context, bot) {
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];
        if (listener.playing && listener.voiceChannel.members.size > 2 && listener.playing.requester !== context.user.id)
            return context.send(`:bangbang: You can only use this command if you're the only one listening or it is your track playing.`);

        let position = context.options.seconds;
        if (position.startsWith("+") || position.startsWith("-"))
            position = (listener.playing.position / 1000) + (parseInt(position));


        if (position * 1000 > listener.playing.info.length)
            return context.send({
                content: `:warning: That would seek past the end of the song. To skip, type ${context.command} skip`,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "skip"))]
            });

        listener.connection.seek(position * 1000);
        return context.send(`Seeked to **${bot.util.shortSeconds(position)}**`);
    }
};