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
        let result = await axios.post(`${await bot.util.getPatchworkHost(context.guild.id)}/pause`, {
            guildId: context.guild.id,
            pause: true,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang("MUSIC_PAUSED");
    }
};