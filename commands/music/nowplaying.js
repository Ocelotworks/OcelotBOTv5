const {axios} = require("../../util/Http");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/06/2019
 * ╚════ ║   (ocelotbotv5) nowplaying
 *  ════╝
 */
module.exports = {
    name: "Now Playing",
    usage: "nowplaying",
    commands: ["nowplaying", "np", "playing"],
    run: async function (context, bot) {
        let {data} = await axios.get(`${bot.util.getPatchworkHost(context.guild.id)}/playing?guild=${context.guild.id}`);

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        return context.send(data.data);
    }
};