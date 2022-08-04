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
            return context.send(":warning: You have to be in a voice channel to use this command.");

        let {data} = await axios.post(`${bot.util.getPatchworkHost(context.guild.id)}/queue`, {
            query: context.options.url,
            guildId: context.guild.id,
            voiceChannelId: context.member.voice.channel.id,
            channelId: context.channel.id,
            userId: context.user.id,
            next: true,
        });

        if(data.err){
            if(data.err === "no results")
                return context.sendLang("MUSIC_NO_RESULTS");
            if(data.err === "listener doesn't exist"){
                return context.send({content: "Couldn't find that video. Try a different search term, or use a link directly", ephemeral: true})
            }
            return context.send({content: `Couldn't queue: ${data.err}`, ephemeral: true})
        }

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
            return context.send(`:white_check_mark: Playing **${data.song.author} - ${data.song.title}**.`);

        return context.sendLang("MUSIC_ADD_VIDEO", data.song);

    }
};