/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) music
 *  ════╝
 */

const request = require('request');
let Discord = require('discord.js');
let bot;

module.exports = {
    name: "Music Streaming",
    usage: "music help/play/skip",
    rateLimit: 10,
    categories: ["voice"],
    requiredPermissions: ["CONNECT", "SPEAK"],
    premium: false,
    commands: ["music", "m"],
    subCommands: {},
    shuffleQueue: [],
    listeners: {
    },
    init: function init(fuckdamn){
        //fuck you
        bot = fuckdamn;
        bot.util.standardNestedCommandInit('music');
        module.exports.populateShuffleQueue();
    },
    run: function (message, args, bot) {
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        bot.util.standardNestedCommand(message,args,bot,'music', module.exports);
    },
    addToQueue: async function(server, search, requester, next = false){
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
                listener.queue[next ? "unshift" : "push"](result.tracks[0]); //I don't like this but it works
                obj = result.tracks[0].info;
                break;
            case "PLAYLIST_LOADED":
                result.tracks.forEach((t)=>t.requester = requester);
                listener.queue[next ? "unshift" : "push"](...result.tracks);
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
    populateShuffleQueue: function populateShuffleQueue(){
        bot.logger.log("Populating shuffle queue");
        request("https://unacceptableuse.com/petify/templates/songs/shuffleQueue", function(err, resp, body){
           if(!err && body){
               try {
                   module.exports.shuffleQueue = JSON.parse(body);
               }catch(e){
                   console.error(e);
               }
           } else{
               bot.logger.warn("Failed to populate shuffleQueue");
           }
        });
    },
    getAutoDJSong: async function getAutoDJSong(){
        return new Promise(async function(fulfill){
            if(module.exports.shuffleQueue.size < 5)
                module.exports.populateShuffleQueue();
            let petifySong = module.exports.shuffleQueue.shift();

            if(!petifySong){
                let songData = await bot.lavaqueue.getSong("https://unacceptableuse.com/petify/song/ecf0cfe1-a893-4594-b353-1dbd7063e241"); //FUCK!
                songData.info.author = "Moloko";
                songData.info.title = "Moloko - The Time Is Now";
                fulfill(songData);
            }else {
                request(`https://unacceptableuse.com/petify/api/song/${petifySong.id}/info`, async function (err, resp, body) {
                    try {
                        const data = JSON.parse(body);
                        let path = data.path;
                        let songData = await bot.lavaqueue.getSong(path);
                        songData.info.author = petifySong.artist;
                        songData.info.title = `${petifySong.artist} - ${petifySong.title}`;
                        songData.info.albumArt = "https://unacceptableuse.com/petify/album/"+data.album;
                        fulfill(songData);
                    } catch (e) {
                        //shid
                        console.error(e);
                    }
                });

            }
        });

    },
    playNextInQueue: async function playNextInQueue(server){
      if(!module.exports.listeners[server]) {
          return bot.logger.warn("Queue is missing!");
      }
        let listener = module.exports.listeners[server];
        let newSong= listener.queue.shift();

        if(listener.editInterval)
            clearInterval(listener.editInterval);

        if(!newSong || (listener.voiceChannel && listener.voiceChannel.members.size === 1)) {

            if(listener.autodj)
                newSong = await module.exports.getAutoDJSong();
            else {
                bot.logger.log("Clearing listener for " + server);
                return bot.lavaqueue.requestLeave(server);
            }
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

        embed.setTitle((listener.connection.paused ? "\\⏸" : "\\▶")+listener.playing.info.title);
        let footer = "";
        let footerIcon = null;
        if(listener.playing.info.uri.indexOf("youtu") > -1) {
            footer = "YouTube";
            footerIcon = "https://i.imgur.com/8iyBEbO.png";
        }
        if(listener.playing.info.uri.startsWith("/home/")) {
            footer = "AutoDJ";
            footerIcon = "https://ocelot.xyz/res/highres.png";
            embed.setColor("#00d800");
        }

        if(listener.playing.info.albumArt)
            embed.setThumbnail(listener.playing.info.albumArt);

        if(listener.queue.length > 0) {
            let title = listener.queue[0].info.title;
            if(title.length > 50)
                title = title.substring(0, 47)+"...";
            footer += " | Next: " + title;
        }

        embed.addField("ℹ Beta", `Music streaming is in Beta. Report any issues with !feedback`);

        embed.setFooter(footer, footerIcon);
        embed.setAuthor("🔈 "+listener.voiceChannel.name);

        if(listener.playing.info.uri.startsWith("http"))
            embed.setURL(listener.playing.info.uri);
        embed.setDescription(listener.playing.info.author);
        let elapsed = listener.connection.state.position || 0;
        let length;
        if(listener.playing.info.length < 9223372036854776000) {//max int
            length = bot.util.progressBar(elapsed, listener.playing.info.length, 20);
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
    deconstructListener: function(server){
        bot.logger.log("Deconstructing listener "+server);
        const listener = module.exports.listeners[server];
        bot.lavaqueue.requestLeave(listener.voiceChannel);
        if(listener.checkInterval)
            clearInterval(listener.checkInterval);
        if(listener.editInterval)
            clearInterval(listener.editInterval);

        module.exports.listeners[server] = undefined;
    },
    playSong: async function playSong(listener){
        if(listener.playing.info.length <= 1000){
            listener.channel.replyLang("MUSIC_PLAY_SHORT");
            return module.exports.playNextInQueue(listener.server);
        }

        if(listener.checkInterval)
            clearInterval(listener.checkInterval);

        if(listener.playing.info.length >= 3.6e+6) { //1 hour
            listener.checkInterval = setInterval(function checkInterval() {
                if(listener.voiceChannel.members.size === 1){
                    listener.channel.replyLang("MUSIC_PLAY_INACTIVE");
                    listener.player.disconnect();
                    module.exports.deconstructListener(listener.server);
                }
            }, 1.8e+6);
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

        bot.matomo.track({
            action_name: "Stream Song",
            uid:  listener.playing.requester,
            url: `http://bot.ocelot.xyz/stream`,
            ua: "Shard "+bot.client.shard_id,
            e_c: "Song",
            e_a: "Streamed",
            e_n: listener.playing.info.title,
            e_v: 1,
            cvar: JSON.stringify({
                1: ['Server ID', listener.server],
                2: ['Server Name', bot.client.guilds.get(listener.server).name],
                3: ['Message', ""],
                4: ['Channel Name', listener.channel.name],
                5: ['Channel ID', listener.channel.id]
            })
        });

    }
};