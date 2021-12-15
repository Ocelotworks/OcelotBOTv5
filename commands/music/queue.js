/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
const Sentry = require('@sentry/node');
module.exports = {
    name: "Queue Song",
    usage: "queue :url+",
    commands: ["queue", "play", "add", "q"],
    run: async function (context, bot) {
        let query = context.options.url;
        let guild = context.guild.id;
        if (!bot.music.listeners[guild]) {
            if (!context.member.voice || !context.member.voice.channel)
                return context.send(":warning: You have to be in a voice channel to use this command.");
            bot.logger.log("Constructing listener");
            await bot.music.constructListener(context.guild, context.member.voice.channel, context.channel);
        }

        // await context.channel.sendTyping();
        try {
            bot.logger.log("Adding song to queue");
            let song = await bot.music.addToQueue(guild, query, context.user.id);
            bot.logger.log("Added song to queue successfully");
            if (!bot.music.listeners[guild])
                return context.send(":thinking: Something went horribly wrong whilst queueing this song. Please try again.");
            if (!song)
                return context.send(":warning: No results.");
            if (song.count)
                return context.send(`:white_check_mark: Added **${song.count}** songs from playlist **${song.name}** (${bot.util.prettySeconds(song.duration / 1000, context.guild && context.guild.id, context.user.id)})`);
            if (song.title?.indexOf("-") > -1)
                return context.send(`:white_check_mark: Added **${song.title}** to the queue.`);
            if (bot.music.listeners[guild].queue.length > 0) {
                return context.send(`:white_check_mark: Added **${song.author} - ${song.title}** to the queue.`);
            }
            return context.send(`:white_check_mark: Playing **${song.author} - ${song.title}**.`);
        } catch (e) {
            context.sendLang("GENERIC_ERROR");
            Sentry.captureException(e);
        }
    }
};