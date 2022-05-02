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

        let {data} = await axios.post(`${bot.util.getPatchworkHost(context.guild.id)}/queue/${context.options.pos}`, {
            guildId: context.guild.id,
            userId: context.user.id,
        });

        if(data?.err === "nothing playing")
            return context.sendLang("MUSIC_NOTHING_PLAYING");

        if(data?.err === "queue empty")
            return context.sendLang("MUSIC_QUEUE_EMPTY");

        if(data?.err === "not permitted")
            return context.send(`:bangbang: Only the person who requested the song (<@${data.requester}>) can remove this song.`);

        if(data?.err === "no item")
            return context.send({
                content: `:warning: There is no item at that position, retrieve the number from **${context.command} list**`,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
            });

        return context.send(`:white_check_mark: Removed **${data.title}**`);
    }
};