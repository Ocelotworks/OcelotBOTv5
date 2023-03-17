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
        let result = await axios.post(`${await bot.util.getPatchworkHost(context.guild.id)}/leave`, {
            guildId: context.guild.id,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang("MUSIC_STOP");
    }
};