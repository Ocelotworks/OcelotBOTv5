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

        let header = `\`\`\`asciidoc\nQueue (${bot.util.prettySeconds(listener.queue.reduce((p, t) => p + t.info.length, 0) / 1000, message.guild && message.guild.id, message.author.id)})\n============\n`;

        let chunkedQueue = listener.queue.chunk(20);
        bot.util.standardPagination(message.channel, chunkedQueue, async function(page, index){
            let output = "";
            output += header;
            for(let i = 0; i < page.length; i++){
                output += `${i+1} :: ${page[i].info.title}\n`;
            }
            if(chunkedQueue.length > 1)
                output += `\nPage ${index+1}/${chunkedQueue.length}`;
            output += "\n```";
            return output;
        });

    }
};