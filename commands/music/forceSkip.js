const {axios} = require("../../util/Http");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) skip
 *  ════╝
 */
module.exports = {
    name: "Force Skip",
    usage: "forceskip",
    settingsOnly: true,
    commands: ["forceskip", "fs"],
    run: async function (context, bot) {
        let result = await axios.post(`${await bot.util.getPatchworkHost(context.guild.id)}/skip`, {
            guildId: context.guild.id,
            userId: context.user.id,
            force: true,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang("MUSIC_SKIPPED");
    }
};