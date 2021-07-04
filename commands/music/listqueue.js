/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) listqueue
 *  ════╝
 */
const Util = require("../../util/Util");
module.exports = {
    name: "List Queue",
    usage: "listqueue",
    commands: ["list", "lq", "upnext", "vq", "viewqueue", "listqueue", "ql"],
    run: async function (context, bot) {
        const guild = context.guild.id;
        if (!bot.music.listeners[guild])
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];

        if (listener.queue.length === 0)
            return context.sendLang("MUSIC_QUEUE_EMPTY");

        let header = `\`\`\`asciidoc\nQueue (${bot.util.prettySeconds(listener.queue.reduce((p, t) => p + t.info.length, 0) / 1000, context.guild && context.guild.id, context.user.id)})\n============\n`;

        let chunkedQueue = listener.queue.chunk(20);
        return Util.StandardPagination(bot, context, chunkedQueue, async function (page, index) {
            let output = "";
            output += header;
            for (let i = 0; i < page.length; i++) {
                output += `${i + 1} :: ${page[i].info.title}\n`;
            }
            if (chunkedQueue.length > 1)
                output += `\nPage ${index + 1}/${chunkedQueue.length}`;
            output += "\n```";
            return {content: output};
        });

    }
};