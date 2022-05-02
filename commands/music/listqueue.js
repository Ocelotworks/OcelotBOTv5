/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) listqueue
 *  ════╝
 */
const Util = require("../../util/Util");
const {axios} = require("../../util/Http");
module.exports = {
    name: "List Queue",
    usage: "listqueue",
    commands: ["list", "lq", "upnext", "vq", "viewqueue", "listqueue", "ql"],
    run: async function (context, bot) {
        let {data} = await axios.get(`${process.env.MUSIC_URL}/queue?guild=${context.guild.id}`);

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        if (data.queue.length === 0)
            return context.sendLang("MUSIC_QUEUE_EMPTY");

        let header = `\`\`\`asciidoc\nQueue (${bot.util.prettySeconds(data.queue.reduce((p, t) => p + t.info.length, 0) / 1000, context.guild && context.guild.id, context.user.id)})\n============\n`;

        let chunkedQueue = data.queue.chunk(10);
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