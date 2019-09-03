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
    addToQueue: async function(server, search, requester){
        let listener = module.exports.listeners[server];
        if(!search.startsWith("http"))
            search = "ytsearch:"+search;

        let result = await bot.lavaqueue.getSongs(search);
        let obj = null;
        // noinspection FallThroughInSwitchStatementJS
        switch(result.loadType){
            case "SEARCH_RESULT":
            case "TRACK_LOADED":
                result.tracks[0].requester = requester;
                listener.queue.push(result.tracks[0]);
                obj = result.tracks[0].info;
                break;
            case "PLAYLIST_LOADED":
                result.tracks.forEach((t)=>t.requester = requester);
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
    playNextInQueue: function playNextInQueue(server){
      if(!module.exports.listeners[server]) {
          console.warn("Nothing is queued");
          throw new Error("Nothing is queued");
      }
        let listener = module.exports.listeners[server];
        let newSong= listener.queue.shift();

        if(listener.editInterval)
            clearInterval(listener.editInterval);

        if(!newSong || (listener.voiceChannel && listener.voiceChannel.members.size === 1)) {
            bot.logger.log("Clearing listener for "+server);
            return module.exports.listeners[server] = null;//Clear listener
        }

        listener.playing = newSong;

        listener.voteSkips = [];
        console.log("Now playing");
        console.log(listener.playing);


        console.log("Playing");
        module.exports.playSong(listener);
        module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener));

        if(listener.channel.guild.getBool("music.updateNowPlaying")) {
            listener.editInterval = setInterval(function updateNowPlaying() {
                module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), false);
            }, parseInt(listener.channel.guild.getSetting("music.updateFrequency")));
        }
    },
    createNowPlayingEmbed: function(listener) {
        let embed = new Discord.RichEmbed();
        embed.setColor("#FF0000");
        embed.setTitle("\\▶ "+listener.playing.info.title);
        let footer = "";
        let footerIcon = null;
        if(listener.playing.info.uri.indexOf("youtu") > -1) {
            footer = "YouTube";
            footerIcon = "https://i.imgur.com/8iyBEbO.png";
        }
        if(listener.queue.length > 0) {
            let title = listener.queue[0].info.title;
            if(title.length > 50)
                title = title.substring(0, 47)+"...";
            footer += " | Next: " + title;
        }

        embed.setFooter(footer, footerIcon);

        embed.setAuthor("🔈 "+listener.voiceChannel.name);
        embed.setURL(listener.playing.info.uri);
        embed.setDescription(listener.playing.info.author);
        let elapsed = (new Date() - listener.connection.timestamp);
        let length;
        if(listener.playing.info.length < 9223372036854776000) {//max int
            length = bot.util.progressBar(elapsed, listener.playing.info.length, 25);
            length += "`" + bot.util.shortSeconds(elapsed / 1000) + "`/";
            length += "`" + bot.util.shortSeconds(listener.playing.info.length / 1000) + "`";
        }else{
            length = bot.util.prettySeconds(elapsed/1000) + " elapsed.";
        }
        embed.addField("Length", length);


        return embed;
    },
    updateOrSendMessage: async function(listener, message, resend = true){
          if(listener.lastMessage && listener.channel.messages.has(listener.lastMessage.id)){
              let keyArray = listener.channel.messages.keyArray();
              if (keyArray.length - keyArray.indexOf(listener.lastMessage.id) < 15)
                  return listener.lastMessage.edit(message);
          }
          if(resend) {
              if(listener.lastMessage)
                  await listener.lastMessage.delete();
              listener.lastMessage = await listener.channel.send(message);
          }//else
           // clearInterval(listener.editInterval);
    },
    playSong: async function playSong(listener){
        if(listener.playing.info.length <= 1000){
            listener.channel.send(":warning: That track is too short to play.");
            return module.exports.playNextInQueue(listener.server);
        }

        bot.raven.captureBreadcrumb({
            message: "Song played",
            track: listener.connection.track,
            server:listener.guild
        });
        listener.connection.play(listener.playing.track);
        setTimeout(bot.lavaqueue.cancelLeave, 100, listener.voiceChannel);

        setTimeout(function(){
            listener.connection.once("error", function playerError(error){
                console.log(error);
                listener.channel.send(":warning: "+error.error);
                bot.raven.captureException(error.error);
                module.exports.playNextInQueue(listener.server);
            });
            listener.connection.once("end", function playerEnd(data){
                if (data.reason === "REPLACED") {
                    return bot.logger.log("Song replaced"); // Ignore REPLACED reason to prevent skip loops
                }
                bot.logger.log("Song ended");
                module.exports.playNextInQueue(listener.server);
                bot.lavaqueue.requestLeave(listener.voiceChannel);
            });
        }, 1000);

    }
};