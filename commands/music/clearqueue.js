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
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];

        if (listener.queue.length === 0)
            return context.sendLang("MUSIC_QUEUE_EMPTY");


        if (listener.voiceChannel.members.size > 2)
            return context.send(`:bangbang: You can only use this command if you're the only one listening.`);

        context.send(`:white_check_mark: Cleared **${listener.queue.length}** items from the queue.`);
        listener.queue = [];
        await bot.database.clearQueue(listener.id);
    }
};