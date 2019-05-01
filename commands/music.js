/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) music
 *  ════╝
 */

const ytdl = require('ytdl-core');
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
    playNextInQueue: function(server){
      if(!module.exports.listeners[server]) {
          console.warn("Nothing is queued");
          throw new Error("Nothing is queued");
      }
        let listener = module.exports.listeners[server];
        listener.playing = listener.queue.pop();

        ytdl.getBasicInfo(listener.playing, function(err, info){
            console.log(JSON.stringify(info));
            if(!info)return;
            let title = info.title;
            let thumbnail = info.thumbnail_url;
            let embed = new Discord.RichEmbed();
            embed.setColor("#36393f");
            embed.setTitle("Now Playing");
            embed.setThumbnail(thumbnail);
            embed.addField("Title", title);
            embed.addField("Length", "a:"+bot.util.prettySeconds(info.lengthSeconds));
            listener.channel.send("",embed);

        });
        console.log("Playing");
        module.exports.playSong(listener)
    },
    playSong: function(listener){
        const stream = ytdl(listener.playing, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1024 * 1024 * 10});

        stream.on('end', function streamEnd(){
            console.log('stream end');
            console.log(arguments);
        });

        stream.on('error', console.log);

        const dispatcher = listener.connection.playStream(stream);

        dispatcher.on('end', function dispatcherEnd(){
            console.log("Dispatcher ended");
            module.exports.playNextInQueue(listener.server);
        })
    }
};