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
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];
        const members = listener.voiceChannel.members.size - 1;
        let skipsNeeded;
        if (members === 1)
            skipsNeeded = 1;
        else if (members <= 3)
            skipsNeeded = 2;
        else if (members <= 5)
            skipsNeeded = Math.round(members * 0.5);
        else
            skipsNeeded = Math.round(members * 0.3);

        if (listener.voteSkips.indexOf(context.user.id) === -1)
            listener.voteSkips.push(context.user.id);

        console.log(listener.voteSkips.length, skipsNeeded);
        if (listener.voteSkips.length >= skipsNeeded) {
            await context.sendLang("MUSIC_SKIPPED");
            return bot.music.playNextInQueue(guild);
        } else
            context.sendLang("MUSIC_SKIP_VOTES", {votes: listener.voteSkips.length, needed: skipsNeeded});

    }
};