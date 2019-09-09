/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) listqueue
 *  ════╝
 */
module.exports = {
    name: "List Queue",
    usage: "listqueue",
    commands: ["list", "lq", "upnext", "vq", "viewqueue", "listqueue", "ql"],
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if(!music.listeners[guild])
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];

        if(listener.queue.length === 0)
            return message.replyLang("MUSIC_QUEUE_EMPTY");


        let output = `\`\`\`asciidoc\nQueue (${bot.util.prettySeconds(listener.queue.reduce((p, t) => p + t.info.length, 0) / 1000)})\n============\n`;
        for(let i = 0; i < listener.queue.length; i++){
            output += `${i+1} :: ${listener.queue[i].info.title}\n`;
        }
        output += "\n```";

        message.channel.send(output);

    }
};