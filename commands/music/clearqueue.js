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
        let result = await axios.delete(`${bot.util.getPatchworkHost(context.guild.id)}/queue?guild=${context.guild.id}`);

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang({content: "MUSIC_QUEUE_CLEAR"}, {amount: result.data.count});
    }
};