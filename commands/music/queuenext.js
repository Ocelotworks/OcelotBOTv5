/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Queue Song Next",
    usage: "queuenext <url/search>",
    commands: ["next", "queuenext", "addnext", "playnext", "qn"],
    run: async function (message, args, bot, music) {
        if (!args[2]) {
            message.replyLang("MUSIC_QUEUE_USAGE");
        } else {
            let query = message.cleanContent.substring(context.command.length + args[1].length + 2).trim();
            let guild = message.guild.id;
            if (!music.listeners[guild]) {
                if (!message.member.voice.channel)
                    return message.channel.send(":warning: You have to be in a voice channel to use this command.");
                await music.constructListener(message.guild, message.member.voice.channel, message.channel);
            }
            let song = await music.addToQueue(guild, query, message.author.id, true);
            if (music.listeners[guild].queue.length > 0) {
                if (!song)
                    return message.replyLang("MUSIC_NO_RESULTS");
                if (song.count)
                    return message.replyLang("MUSIC_ADD_PLAYLIST", {
                        count: song.count,
                        playlist: song.name,
                        length: bot.util.prettySeconds(song.duration / 1000, message.guild && message.guild.id, message.author.id)
                    });
                if (song.title.indexOf("-") > -1)
                    return message.replyLang("MUSIC_ADD_SONG", {title: song.title});

                message.replyLang("MUSIC_ADD_VIDEO", {title: song.title, author: song.author});
            }
        }

    }
};