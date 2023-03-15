/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) listqueue
 *  ════╝
 */
const Sentry = require("@sentry/node");
const Util = require("../../util/Util");
const {axios} = require("../../util/Http");
module.exports = {
    name: "List Queue",
    usage: "listqueue",
    commands: ["list", "lq", "upnext", "vq", "viewqueue", "listqueue", "ql"],
    run: async function (context, bot) {
        let result = await axios.get(`${await bot.util.getPatchworkHost(context.guild.id)}/queue?guild=${context.guild.id}`);

        if(context.commandData.handlePatchworkError(result, context))return;

        const {data} = result;

        if(!data.queue) {
            Sentry.addBreadcrumb({
                message: "Patchwork response",
                data
            })
            Sentry.captureMessage("Response from patchwork contained no queue")
            return context.send("Received an unexpected response. Please wait a second and try again. If the problem persists, do /music stop and then queue again.");
        }

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