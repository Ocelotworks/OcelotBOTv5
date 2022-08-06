const {axios} = require("../../util/Http");
const Sentry = require("@sentry/node");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/09/2019
 * ╚════ ║   (ocelotbotv5) resume
 *  ════╝
 */
module.exports = {
    name: "Resume Song",
    usage: "resume",
    commands: ["resume", "unpause"],
    run: async function (context, bot) {
        let result = await axios.post(`${bot.util.getPatchworkHost(context.guild.id)}/pause`, {
            guildId: context.guild.id,
            pause: false,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang("MUSIC_RESUMED");
    }
};