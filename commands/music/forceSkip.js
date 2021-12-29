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
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        await context.sendLang("MUSIC_SKIPPED");
        return bot.music.playNextInQueue(guild);
    }
};