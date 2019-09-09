/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Queue Song",
    usage: "queue <url/next>",
    commands: ["queue", "play", "add", "q"],
    run: async function(message, args, bot, music){
        if(!args[2])
            return message.replyLang("MUSIC_QUEUE_USAGE");

        let query = message.cleanContent.substring(args[0].length+args[1].length+2).trim();
        let guild = message.guild.id;
        if(!music.listeners[guild]){
            if(!message.member.voiceChannel)
                return message.channel.send(":warning: You have to be in a voice channel to use this command.");
           await music.constructListener(message.guild, message.member.voiceChannel, message.channel);
        }

        let song = await music.addToQueue(guild, query, message.author.id);
        if(music.listeners[guild].queue.length > 0) {
            if (!song)
                return message.channel.send(":warning: No results.");
            if (song.count)
                return message.channel.send(`:white_check_mark: Added **${song.count}** songs from playlist **${song.name}** (${bot.util.prettySeconds(song.duration / 1000)})`);
            if(song.title.indexOf("-") > -1)
                return message.channel.send(`:white_check_mark: Added **${song.title}** to the queue.`);

            message.channel.send(`:white_check_mark: Added **${song.author} - ${song.title}** to the queue.`);
        }
    }
};