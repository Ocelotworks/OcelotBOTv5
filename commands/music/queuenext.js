/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Queue Song Next",
    usage: "queuenext :url+",
    commands: ["next", "queuenext", "addnext", "playnext", "qn"],
    run: async function (context, bot) {
        let query = context.options.url;
        let guild = context.guild.id;
        if (!bot.music.listeners[guild]) {
            if (!context.member.voice.channel)
                return context.send(":warning: You have to be in a voice channel to use this command.");
            await bot.music.constructListener(context.guild, context.member.voice.channel, context.channel);
        }
        let song = await bot.music.addToQueue(guild, query, context.user.id, true);
        if (bot.music.listeners[guild].queue.length > 0) {
            if (!song)
                return context.sendLang("MUSIC_NO_RESULTS");
            if (song.count)
                return context.sendLang("MUSIC_ADD_PLAYLIST", {
                    count: song.count,
                    playlist: song.name,
                    length: bot.util.prettySeconds(song.duration / 1000, context.guild && context.guild.id, context.user.id)
                });
            if (song.title.indexOf("-") > -1)
                return context.sendLang("MUSIC_ADD_SONG", {title: song.title});

            return context.sendLang("MUSIC_ADD_VIDEO", {title: song.title, author: song.author});
        }

    }
};