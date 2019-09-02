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
        if(!search.startsWith("http"))
            search = "ytsearch:"+search;

        let result = await bot.lavaqueue.getSongs(search);
        let obj = null;
        // noinspection FallThroughInSwitchStatementJS
        switch(result.loadType){
            case "SEARCH_RESULT":
            case "TRACK_LOADED":
                listener.queue.push(result.tracks[0]);
                obj = result.tracks[0].info;
                break;
            case "PLAYLIST_LOADED":
                listener.queue.push(...result.tracks);
                obj = { count: result.tracks.length,
                        name: result.playlistInfo.name,
                        duration: result.tracks.reduce((p, t)=>p+t.info.length, 0)};
                break;
            default:
                console.warn("Unknown type "+result.loadType);
            case "LOAD_FAILED":
            case "NO_MATCHES":
                obj = null;
        }
        if(!listener.playing)
            module.exports.playNextInQueue(server);

        return obj;
    },
    playNextInQueue: function(server){
      if(!module.exports.listeners[server]) {
          console.warn("Nothing is queued");
          throw new Error("Nothing is queued");
      }
        let listener = module.exports.listeners[server];
        let newSong= listener.queue.shift();

        if(!newSong)
            return listener.connection.stop();

        listener.playing = newSong;

        listener.voteSkips = [];
        console.log("Now playing");
        console.log(listener.playing);


        console.log("Playing");
        module.exports.playSong(listener);
        listener.channel.send(module.exports.createNowPlayingEmbed(listener));
    },
    createNowPlayingEmbed: function(listener) {
        let embed = new Discord.RichEmbed();
        embed.setColor("#FF0000");
        embed.setTitle("\\▶ "+listener.playing.info.title);
        if(listener.playing.info.uri.indexOf("youtu") > -1)
            embed.setFooter("YouTube", "https://i.imgur.com/8iyBEbO.png");
        embed.setAuthor("🔈 "+listener.voiceChannel.name);
        embed.setURL(listener.playing.info.uri);
        embed.setDescription(listener.playing.info.author);

        let elapsed = (new Date()-listener.connection.timestamp);
        let length = bot.util.progressBar(elapsed, listener.playing.info.length, 25);
        length += "`"+bot.util.shortSeconds(elapsed/1000)+"`/";
        length += "`"+bot.util.shortSeconds(listener.playing.info.length/1000)+"`";
        embed.addField("Length", length);

        return embed;
    },
    playSong: async function playSong(listener){
        console.log("play play");

        listener.connection.play(listener.playing.track);
        setTimeout(bot.lavaqueue.cancelLeave, 500, listener.voiceChannel);

        listener.connection.on("error", function playerError(error){
           console.log(error);
           module.exports.playNextInQueue(listener.server);
        });
        listener.connection.once("end", data => {
            if (data.reason === "REPLACED") return; // Ignore REPLACED reason to prevent skip loops
            bot.logger.log("Song ended");
            module.exports.playNextInQueue(listener.server);
            bot.lavaqueue.requestLeave(listener.voiceChannel);
        });
    }
};