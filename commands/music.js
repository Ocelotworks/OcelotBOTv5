/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) music
 *  ════╝
 */

const ytdl = require('ytdl-core');
const ytdl_discord = require('ytdl-core-discord');
const fs = require('fs');
let Discord = require('discord.js');
let bot;

module.exports = {
    name: "Music Streaming",
    usage: "music help/play/skip",
    rateLimit: 10,
    categories: ["voice"],
    requiredPermissions: ["CONNECT", "SPEAK"],
    premium: false,
    hidden: true,
    commands: ["music", "m"],
    subCommands: {},
    listeners: {
        'dummy': {
            playing: "aaaaa bboooobs",
            connection: null,
            channel: null,
            server: null,
            queue: []
        }
    },
    init: function init(fuckdamn){
        //fuck you
        bot = fuckdamn;
        bot.util.standardNestedCommandInit('music');
    },
    run: function (message, args, bot) {
        bot.util.standardNestedCommand(message,args,bot,'music', module.exports);
    },
    addToQueue: async function(server, search){
        let listener = module.exports.listeners[server];
        const isValid = ytdl.validateID(search) || ytdl.validateURL(search);
        if(isValid){
            let info = await ytdl.getBasicInfo(search);
            let song = {
                author: info.media && info.media.artist ? info.media.artist : info.author.name,
                title: info.media && info.media.song ? info.media.song : info.title,
                seconds: info.length_seconds,
                url: info.video_url,
                thumbnail: info.thumbnail_url
            };
            listener.queue.push(song);

            if(!listener.playing)
                module.exports.playNextInQueue(server);
            return song;
        }

    },
    playNextInQueue: function(server){
      if(!module.exports.listeners[server]) {
          console.warn("Nothing is queued");
          throw new Error("Nothing is queued");
      }
        let listener = module.exports.listeners[server];
        listener.playing = listener.queue.pop();

        if(!listener.playing)
            return;

        console.log(listener.playing);


        console.log("Playing");
        module.exports.playSong(listener);

        let embed = new Discord.RichEmbed();
        embed.setColor("#36393f");
        embed.setTitle("Now Playing");
        embed.setURL(listener.playing.url);
        embed.setThumbnail(listener.playing.thumbnail);
        embed.addField("Title", listener.playing.title);
        embed.addField("Author", listener.playing.author);

        embed.addField("Length", bot.util.prettySeconds(parseInt(listener.playing.seconds)));
        listener.channel.send("",embed);

    },
    playSong: async function playSong(listener){
        console.log("play play");
        try {
            const stream = await ytdl_discord(listener.playing.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1024 * 1024 * 10
            });
            console.log("stream stream");
            stream.on('error', console.error);

            if (listener.connection.dispatcher) {
                bot.logger.log("Attempting to destroy previous dispatcher");
                listener.connection.dispatcher.end();
            }

            const dispatcher = listener.connection.playOpusStream(stream);
            console.log("dispatchy spatch spatch");
            dispatcher.on('end', function dispatcherEnd() {
                console.log("Dispatcher ended");
                module.exports.playNextInQueue(listener.server);
            });

            dispatcher.on('error', console.error);
        }catch(e){
            console.error(e);
            module.exports.playNextInQueue(listener.server);
        }
    }
};