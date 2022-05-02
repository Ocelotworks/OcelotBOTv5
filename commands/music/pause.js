const {axios} = require("../../util/Http");
const Sentry = require('@sentry/node');
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) pause
 *  ════╝
 */
module.exports = {
    name: "Pause Song",
    usage: "pause",
    commands: ["pause", "p"],
    run: async function (context, bot) {
        let {data} = await axios.post(`${process.env.MUSIC_URL}/pause`, {
            guildId: context.guild.id,
            pause: true,
        });

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        if(data?.err === "not permitted")
            return context.send(`:bangbang: You can only use this command if you're the only one listening or it is your track playing.`);

        if(!data || data.err){
            Sentry.captureMessage("Invalid response from patchwork on pause");
            return context.sendLang({content: "GENERIC_ERROR"});
        }

        return context.send("⏸ Paused.");
    }
};