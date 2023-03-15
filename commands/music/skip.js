const {axios} = require("../../util/Http");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) skip
 *  ════╝
 */
module.exports = {
    name: "Skip Song",
    usage: "skip",
    commands: ["skip", "next", "s", "n"],
    run: async function (context, bot) {
        let result = await axios.post(`${await bot.util.getPatchworkHost(context.guild.id)}/skip`, {
            guildId: context.guild.id,
            userId: context.user.id,
            force: false,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        const {data} = result;

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        if (data.skips >= data.needed) {
            return context.sendLang("MUSIC_SKIPPED");
        }
        return context.sendLang("MUSIC_SKIP_VOTES", {votes: data.skips, needed: data.needed});
    }
};