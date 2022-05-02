const {axios} = require("../../util/Http");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Clear Queue",
    usage: "clearqueue",
    commands: ["clear", "cq", "clearqueue", "qc"],
    run: async function (context, bot) {
        let {data} = await axios.delete(`${process.env.MUSIC_URL}/queue?guild=${context.guild.id}`);

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        if (data?.err === "queue empty")
            return context.sendLang("MUSIC_QUEUE_EMPTY");

        if (data?.err === "not permitted")
            return context.send(`:bangbang: You can only use this command if you're the only one listening.`);

        return context.send(`:white_check_mark: Cleared **${data.count}** items from the queue.`);
    }
};