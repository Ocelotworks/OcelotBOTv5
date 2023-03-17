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
        let result = await axios.get(`${await bot.util.getPatchworkHost(context.guild.id)}/playing?guild=${context.guild.id}`);

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.send(result.data.data);
    }
};