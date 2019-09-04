/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 03/09/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Queue Item",
    usage: "remove",
    commands: ["remove", "rq", "rem", "removequeue"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if(!music.listeners[guild] || !music.listeners[guild].playing)
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];

        if(listener.queue.length === 0)
            return message.replyLang("MUSIC_QUEUE_EMPTY");


        if(!args[2] || isNaN(args[2])) {
            let output = `\`\`\`asciidoc\nEnter ${args[0]} ${args[1]} and then a number below:\n============\n`;
            for (let i = 0; i < listener.queue.length; i++) {
                output += `${i + 1} :: ${listener.queue[i].info.title}\n`;
            }
            output += "\n```";
            message.channel.send(output);
        }else{
            let pos = parseInt(args[2])-1;
            if(!listener.queue[pos])
                return message.channel.send(`:warning: There is no item at that position, retrieve the number from **${args[0]} list**`);

            if(listener.voiceChannel.members.size > 2 && listener.queue[pos].requester !== message.author.id)
                return message.channel.send(`:bangbang: Only the person who requested the song (<@${listener.queue[pos].requester}>) can remove this song.`);

            message.channel.send(`:white_check_mark: Removed **${listener.queue[pos].title}**`);
            listener.queue.splice(pos, 1);
        }

    }
};