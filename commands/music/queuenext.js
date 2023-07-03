const {axios} = require("../../util/Http");
const Sentry = require("@sentry/node");
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Queue Song Next",
    usage: "queuenext :url+",
    commands: ["next", "queuenext", "addnext", "playnext", "qn"],
    run: async function (context, bot) {
        if (!context.member.voice || !context.member.voice.channel)
            return context.send({content: ":warning: You have to be in a voice channel to use this command.", ephemeral: true});

        await context.defer();

        let result = await axios.post(`${await bot.util.getPatchworkHost(context.guild.id)}/queue`, {
            query: context.options.url,
            guildId: context.guild.id,
            voiceChannelId: context.member.voice.channel.id,
            channelId: context.channel.id,
            userId: context.user.id,
            next: true,
        });

        if(context.commandData.handlePatchworkError(result, context))return;

        const {data} = result;

        if(!data.success || !data.song){
            Sentry.captureMessage("Invalid response from patchwork on queuenext");
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true})
        }

        if (data.song.count)
            return context.sendLang("MUSIC_ADD_PLAYLIST", {
                count: data.song.count,
                playlist: data.song.name,
                length: bot.util.prettySeconds(data.song.duration / 1000, context.guild && context.guild.id, context.user.id)
            });
        if (data.song.title.indexOf("-") > -1)
            return context.sendLang("MUSIC_ADD_SONG", {title: data.song.title});

        if(data.now)
            return context.sendLang("MUSIC_PLAYING_NOW", data.song);

        return context.sendLang("MUSIC_ADD_VIDEO", data.song);

    }
};