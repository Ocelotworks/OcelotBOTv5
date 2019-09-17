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

        bot.client.on("ready", async function ready(){
            let activeSessions = await bot.database.getActiveSessions();
            for(let i = 0; i < activeSessions.length; i++){
                const session = activeSessions[i];
                if(bot.client.guilds.has(session.server)){
                    bot.logger.log(`Resuming session ${session.id}`);
                    const listener = await module.exports.constructListener(bot.client.guilds.get(session.server), bot.client.channels.get(session.voiceChannel), bot.client.channels.get(session.textChannel), session.id);
                    listener.playing = await bot.lavaqueue.getSong(session.playing);
                    if(session.lastMessage){
                        listener.lastMessage = await listener.channel.fetchMessage(session.lastMessage);
                        module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), true);
                        if(listener.channel.guild.getBool("music.updateNowPlaying")) {
                            listener.editInterval = setInterval(function updateNowPlaying() {
                                if(module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), false))
                                    clearInterval(listener.editInterval);
                            }, parseInt(listener.channel.guild.getSetting("music.updateFrequency")));
                        }
                    }
                    module.exports.requeue(session, await bot.database.getQueueForSession(session.id));
                }
            }
        });
        bot.music = module.exports;
    },
    requeue: async function requeue(session, queue){
        bot.logger.log("Populating queue with "+queue.length+" songs.");
        for(let i = 0; i < queue.length; i++){
            let song = queue[i];
            await module.exports.addToQueue(session.server,  song.uri, song.requester, false, song.id);
        }
    },
    run: function (message, args, bot) {
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        bot.util.standardNestedCommand(message,args,bot,'music', module.exports);
    },
    //shit
    _addToQueue: async function(listener, track, requester, next, id){
        track.requester = requester;
        if(!id)
            track.id = await bot.database.queueSong(listener.id, track.info.uri, requester, next);
        else
            track.id = id;
        listener.queue[next ? "unshift" : "push"](track);
    },
    addToQueue: async function(server, search, requester, next = false, id){
        let listener = module.exports.listeners[server];
        if(!search.startsWith("http"))
            search = "ytsearch:"+search;

        let result = await bot.lavaqueue.getSongs(search);
        let obj = null;
        // noinspection FallThroughInSwitchStatementJS
        switch(result.loadType){
            case "SEARCH_RESULT":
            case "TRACK_LOADED":
                await module.exports._addToQueue(listener, result.tracks[0], requester, next, id);
                obj = result.tracks[0].info;
                break;
            case "PLAYLIST_LOADED":
                result.tracks.forEach(async (t)=>await module.exports._addToQueue(listener, t, requester, next, id));
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

        if(!listener.playing && !id) {
            bot.logger.log("Playing next in queue");
            module.exports.playNextInQueue(server);
        }else{
            bot.logger.log("Not playing now as something is playing or this is a session resume");
        }

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
                listener.playing = null;
                return bot.lavaqueue.requestLeave(listener.voiceChannel, "Queue is empty and AutoDJ is disabled.");
            }
        }
        if(newSong.id)
            await bot.database.removeSong(newSong.id);

        listener.playing = newSong;

        listener.voteSkips = [];
        console.log("Now playing");
        console.log(listener.playing);


        console.log("Playing");
        module.exports.playSong(listener);
        module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener));

        if(listener.channel.guild.getBool("music.updateNowPlaying")) {
            listener.editInterval = setInterval(function updateNowPlaying() {
                if(module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), false))
                    clearInterval(listener.editInterval);
            }, parseInt(listener.channel.guild.getSetting("music.updateFrequency")));
        }
    },
    createNowPlayingEmbed: function(listener) {
        let embed = new Discord.RichEmbed();

        embed.setColor("#2d303d");
        embed.setTitle((listener.connection.paused ? "\\⏸" : "\\▶")+listener.playing.info.title);
        let footer = "";
        let footerIcon = null;
        if(listener.playing.info.uri.indexOf("youtu") > -1) {
            footer = "YouTube";
            footerIcon = "https://i.imgur.com/8iyBEbO.png";
            embed.setColor("#FF0000");
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
        let elapsed = listener.playing.position || 0;
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
          if(listener.lastMessage && listener.channel.messages.has(listener.lastMessage.id) && !listener.lastMessage.deleted){
              let keyArray = listener.channel.messages.keyArray();
              if (keyArray.length - keyArray.indexOf(listener.lastMessage.id) < 15) {
                  listener.lastMessage.edit(message);
                  return false;
              }
          }
          if(resend) {
              try {
                if(listener.lastMessage)
                    await listener.lastMessage.delete();
                  listener.lastMessage = await listener.channel.send(message);
                  await bot.database.updateLastMessage(listener.id, listener.lastMessage.id);
              }catch(e){
                  return true;
              }
          }
          return false;
    },
    constructListener: async function constructListener(server, voiceChannel, channel, id){
        const host = bot.util.arrayRand(server.getSetting("music.host").split(","));
        bot.logger.log("Using host "+host);
        let player = bot.lavaqueue.manager.players.get(server.id);
        await player.join(voiceChannel.id);
        if(!id) {
            id = await bot.database.createMusicSession(server.id, voiceChannel.id, channel.id);


            let oldQueues = await bot.database.getPreviousQueue(server, id);
            if(oldQueues.length > 0)
                channel.send(`:information_source: You have **${oldQueues.length}** previous queues stored. To restore or clear them, type ${channel.guild.getSetting("prefix")}music requeue`);
        }
        let listener = module.exports.listeners[server.id] = {
            connection: player,
            voteSkips: [],
            queue: [],
            server: server.id,
            playing: null,
            voiceChannel,
            channel,
            host,
            id,
        };
        listener.connection.on("event", function trackEvent(evt){
            if(evt.type === "TrackEndEvent" && evt.reason !== "REPLACED"){
                bot.logger.log("Song ended");
                module.exports.playNextInQueue(listener.server);
                bot.lavaqueue.requestLeave(listener.voiceChannel, "Song has ended");
            }else{
                console.log(evt);
            }
        });
        listener.connection.on("playerUpdate", function playerUpdate(evt){
            if(listener && listener.playing)
                listener.playing.position = evt.state.position;
        });
        listener.connection.on("error", function playerError(error){
            console.log(error);
            listener.channel.send(":warning: "+error.error);
            bot.raven.captureException(error.error);
            module.exports.playNextInQueue(listener.server);
        });

        return listener;
    },
    deconstructListener: async function(server){
        bot.logger.log("Deconstructing listener "+server);
        const listener = module.exports.listeners[server];
        if(!listener)return;
        bot.lavaqueue.requestLeave(listener.voiceChannel, "Listener was deconstructed");
        if(listener.checkInterval)
            clearInterval(listener.checkInterval);
        if(listener.editInterval)
            clearInterval(listener.editInterval);
        module.exports.listeners[server] = undefined;
        await bot.database.endMusicSession(listener.id);
    },
    playSong: async function playSong(listener){
        if(listener.playing.info.length <= 1000){
            listener.channel.replyLang("MUSIC_PLAY_SHORT");
            return module.exports.playNextInQueue(listener.server);
        }

        await bot.database.updateNowPlaying(listener.id, listener.playing.info.uri);

        if(listener.checkInterval)
            clearInterval(listener.checkInterval);

        if(listener.playing.info.length >= 3.6e+6) { //1 hour
            listener.checkInterval = setInterval(async function checkInterval() {
                if(listener.voiceChannel.members.size === 1){
                    //listener.channel.replyLang("MUSIC_PLAY_INACTIVE"); hm
                    await listener.player.leave();
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