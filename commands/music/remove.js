const {axios} = require("../../util/Http");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 03/09/2019
 * ╚════ ║   (ocelotbotv5) remove
 *  ════╝
 */
module.exports = {
    name: "Remove Queue Item",
    usage: "remove :0pos?",
    commands: ["remove", "r", "rem", "removequeue"],
    run: async function (context, bot) {
        if (!context.options.pos) {
            return context.send({
                content: `You must enter a track number to remove. Check **${context.getSetting("prefix")}music list** to find the track number.`,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
            });
        }

        let result = await axios.post(`${bot.util.getPatchworkHost(context.guild.id)}/queue/${context.options.pos}`, {
            guildId: context.guild.id,
            userId: context.user.id,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        return context.sendLang("MUSIC_REMOVED", result.data);
    }
};