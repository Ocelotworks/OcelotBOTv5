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
    run: async function (message, args, bot, music) {
        const guild = message.guild.id;
        if (!music.listeners[guild] || !music.listeners[guild].playing)
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];
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

        if (listener.voteSkips.indexOf(message.author.id) === -1)
            listener.voteSkips.push(message.author.id);

        console.log(listener.voteSkips.length, skipsNeeded);
        if (listener.voteSkips.length >= skipsNeeded) {
            await message.replyLang("MUSIC_SKIPPED");
            music.playNextInQueue(guild);
        } else
            message.replyLang("MUSIC_SKIP_VOTES", {votes: listener.voteSkips.length, needed: skipsNeeded});

    }
};