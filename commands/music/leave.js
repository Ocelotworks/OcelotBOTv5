/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) leave
 *  ════╝
 */
const {axios} = require("../../util/Http");
module.exports = {
    name: "Leave Channel",
    usage: "leave",
    commands: ["leave", "quit", "stop"],
    run: async function (context, bot) {
        let {data} = await axios.post(`${bot.util.getPatchworkHost(context.guild.id)}/leave`, {
            guildId: context.guild.id,
        });

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        return context.send(":wave: Goodbye.");
    }
};