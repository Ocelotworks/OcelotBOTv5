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
        const guild = context.guild.id;
        if (!bot.music.listeners[guild] || !bot.music.listeners[guild].playing)
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        const listener = bot.music.listeners[guild];

        if (listener.queue.length === 0)
            return context.sendLang("MUSIC_QUEUE_EMPTY");


        if (!context.options.pos) {
            let output = `\`\`\`asciidoc\nEnter ${context.command} ${context.options.command} and then a number below:\n============\n`;
            for (let i = 0; i < listener.queue.length; i++) {
                output += `${i + 1} :: ${listener.queue[i].info.title}\n`;
            }
            output += "\n```";
            context.send(output);
        } else {
            let pos = context.options.pos-1
            if (!listener.queue[pos])
                return context.send({
                    content: `:warning: There is no item at that position, retrieve the number from **${context.command} list**`,
                    components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
                });

            if (listener.voiceChannel.members.size > 2 && listener.queue[pos].requester !== context.user.id)
                return context.send(`:bangbang: Only the person who requested the song (<@${listener.queue[pos].requester}>) can remove this song.`);

            await context.send(`:white_check_mark: Removed **${listener.queue[pos].info.title}**`);
            await bot.database.removeSong(listener.queue[pos].id);
            listener.queue.splice(pos, 1);
        }

    }
};