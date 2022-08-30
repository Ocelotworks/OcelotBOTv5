/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) music
 *  ════╝
 */

const request = require('request');
let Discord = require('discord.js');
const Sentry = require('@sentry/node');
let bot;

// I hate ALL of this code
module.exports = {
    name: "Music Streaming",
    usage: "music",
    rateLimit: 10,
    categories: ["voice"],
    premium: false,
    commands: ["music", "m"],
    guildOnly: true,
    nestedDir: "music",
    init: function init(bot) {
        bot.client.on("ready", async function ready() {
            let activeSessions = await bot.database.getActiveSessions();
            for (let i = 0; i < activeSessions.length; i++) {
                const session = activeSessions[i];
                bot.logger.log("Ending music session "+session.id);
                await bot.database.endMusicSession(session.id);
            }
        });
        bot.music = {
            shuffleQueue: [],
            listeners: {},
            requeue: async function requeue(session, queue) {
                bot.logger.log("Populating queue with " + queue.length + " songs.");
                for (let i = 0; i < queue.length; i++) {
                    let song = queue[i];
                    await bot.music.addToQueue(session.server, song.uri, song.requester, false, song.id);
                }
            },
            //shit
            _addToQueue: async function (listener, track, requester, next, id) {
                track.requester = requester;
               // if (!id)
                  //  track.id = await bot.database.queueSong(listener.id, track.info.uri, requester, next);
               // else
                    track.id = 0;
                listener.queue[next ? "unshift" : "push"](track);
            },
            addToQueue: async function (server, search, requester, next = false, id) {
                let listener = bot.music.listeners[server];
                if (!listener) { // Not sure how we got here
                    bot.logger.error("The bad things happened");
                    console.log(bot.music.listeners);
                    Sentry.setExtra("listeners", bot.music.listeners);
                    Sentry.captureMessage("Invalid state: addToQueue successfully called with no listener");
                    return null;
                }

                bot.logger.log("Listener is valid");

                if (!search.startsWith("http")) {
                    search = "ytsearch:" + search;
                    bot.logger.log("This is not an URL: " + search);
                }

                bot.logger.log("Fetching song results");
                let result = await bot.lavaqueue.getSongs(search, listener.connection);
                bot.logger.log(`Got result: ${JSON.stringify(result)}`)
                let obj = null;
                // noinspection FallThroughInSwitchStatementJS
                switch (result.loadType) {
                    case "SEARCH_RESULT":
                    case "TRACK_LOADED":
                        bot.logger.log("Track was successfully loaded");
                        await bot.music._addToQueue(listener, result.tracks[0], requester, next, id);
                        obj = result.tracks[0].info;
                        bot.logger.log(`Object is now: ${obj}`);
                        break;
                    case "PLAYLIST_LOADED":
                        bot.logger.log("Playlist was successfully loaded");
                        for (const t of result.tracks) {
                            await bot.music._addToQueue(listener, t, requester, next, id);
                        }
                        obj = {
                            count: result.tracks.length,
                            name: result.playlistInfo.name,
                            duration: result.tracks.reduce((p, t) => p + t.info.length, 0)
                        };
                        break;
                    default:
                        console.warn("Unknown type " + result.loadType);
                    case "LOAD_FAILED":
                        obj = {err: result.exception}
                    case "NO_MATCHES":
                        bot.logger.log("Load failed " + result.loadType);
                        obj = null;
                }

                if (!listener.playing && !id) {
                    bot.logger.log("Playing next in queue");
                    bot.music.playNextInQueue(server);
                } else {
                    bot.logger.log("Not playing now as something is playing or this is a session resume");
                    console.log(listener.playing);
                }
                bot.logger.log("We actually got to the fucking end");
                return obj;
            },
            populateShuffleQueue: function populateShuffleQueue() {
                bot.logger.log("Populating shuffle queue");
                request("https://unacceptableuse.com/petify/templates/songs/shuffleQueue", function (err, resp, body) {
                    if (!err && body) {
                        try {
                            bot.music.shuffleQueue = JSON.parse(body);
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        bot.logger.warn("Failed to populate shuffleQueue");
                    }
                });
            },
            getAutoDJSong: async function getAutoDJSong(player) {
                return new Promise(async function (fulfill) {
                    if (bot.music.shuffleQueue.length < 5)
                        bot.music.populateShuffleQueue();
                    let petifySong = bot.music.shuffleQueue.shift();

                    if (!petifySong) {
                        bot.logger.warn("Shits fucked");
                        let songData = await bot.lavaqueue.getSong("https://unacceptableuse.com/petify/song/ecf0cfe1-a893-4594-b353-1dbd7063e241", player); //FUCK!
                        songData.info.author = "Moloko";
                        songData.info.title = "Moloko - The Time Is Now";
                        fulfill(songData);
                        bot.music.populateShuffleQueue();
                    } else {
                        request(`https://unacceptableuse.com/petify/api/song/${petifySong.id}/info`, async function (err, resp, body) {
                            try {
                                const data = JSON.parse(body);
                                let path = data.path;
                                let songData = await bot.lavaqueue.getSong(path, player);
                                songData.info.author = petifySong.artist;
                                songData.info.title = `${petifySong.artist} - ${petifySong.title}`;
                                songData.info.albumArt = "https://unacceptableuse.com/petify/album/" + data.album;
                                fulfill(songData);
                            } catch (e) {
                                //shid
                                console.error(e);
                            }
                        });

                    }
                });

            },
            playNextInQueue: async function playNextInQueue(server) {
                bot.logger.log(`Playing next song for ${server}`);
                if (!bot.music.listeners[server]) {
                    return bot.logger.warn(`Queue for ${server} is missing!`);
                }

                let listener = bot.music.listeners[server];
                console.log(listener.queue);
                let newSong = listener.queue.shift();
                bot.logger.log("New song is " + JSON.stringify(newSong));

                if (listener.editInterval) {
                    bot.logger.log("Clearing edit interval");
                    clearInterval(listener.editInterval);
                }

                if (!newSong || (listener.voiceChannel && listener.voiceChannel.members.size === 1)) {
                    bot.logger.log("There is no new song, or the voice channel is empty");
                    if (listener.autodj) {
                        bot.logger.log("AutoDJ is enabled, so play next song");
                        newSong = await bot.music.getAutoDJSong(listener.connection);
                    } else {
                        bot.logger.log("Requesting leave")
                        listener.playing = null;
                        listener.connection.pause(true);
                        return bot.lavaqueue.requestLeave(listener.voiceChannel, "Queue is empty and AutoDJ is disabled.");
                    }
                }
                if (newSong.id) {
                    bot.logger.log("Removing song from queue");
                    await bot.database.removeSong(newSong.id);
                }
                listener.playing = newSong;

                listener.voteSkips = [];

                bot.logger.log("Playing new song " + JSON.stringify(newSong));
                bot.music.playSong(listener);
                bot.logger.log("Sending update message");
                await bot.music.updateOrSendMessage(listener, bot.music.createNowPlayingEmbed(listener));

                if (listener.channel.guild.getBool("bot.music.updateNowPlaying")) {
                    listener.editInterval = setInterval(function updateNowPlaying() {
                        if (bot.music.updateOrSendMessage(listener, bot.music.createNowPlayingEmbed(listener), false))
                            clearInterval(listener.editInterval);
                    }, parseInt(listener.channel.guild.getSetting("bot.music.updateFrequency")));
                }
            },
            createNowPlayingEmbed: function (listener) {
                if (!listener) return;
                if (!listener.playing || !listener.playing.info) return;
                let embed = new Discord.MessageEmbed();

                embed.setColor("#2d303d");

                embed.setTitle((listener.connection.paused ? "\\⏸" : "\\▶") + listener.playing.info.title);
                let footer = "";
                let footerIcon = null;
                if (listener.playing.info.uri.indexOf("youtu") > -1) {
                    footer = "YouTube";
                    footerIcon = "https://i.imgur.com/8iyBEbO.png";
                    embed.setColor("#FF0000");
                }
                if (listener.playing.info.uri.startsWith("/home/")) {
                    footer = "AutoDJ";
                    footerIcon = "https://ocelotbot.xyz/res/highres.png";
                    embed.setColor("#00d800");
                }

                if (listener.playing.info.albumArt)
                    embed.setThumbnail(listener.playing.info.albumArt);


                if (listener.queue.length > 0) {
                    let title = listener.queue[0].info.title;
                    if (title.length > 50)
                        title = title.substring(0, 47) + "...";
                    footer += " | Next: " + title;
                }

                embed.addField("ℹ Beta", `Music streaming is in Beta. Report any issues with !feedback`);

                embed.setFooter(footer, footerIcon);
                embed.setAuthor("🔈 " + listener.voiceChannel.name);

                if (listener.playing.info.uri.startsWith("http"))
                    embed.setURL(listener.playing.info.uri);
                embed.setDescription(listener.playing.info.author);
                let elapsed = listener.playing.position || 0;
                let length;
                if (listener.playing.info.length < 9223372036854776000) {//max int
                    length = bot.util.progressBar(elapsed, listener.playing.info.length, 20);
                    length += "`" + bot.util.shortSeconds(elapsed / 1000) + "`/";
                    length += "`" + bot.util.shortSeconds(listener.playing.info.length / 1000) + "`";
                } else {
                    length = bot.util.prettySeconds(elapsed / 1000, "global") + " elapsed.";
                }
                embed.addField("Length", length);
                return {embeds: [embed]};
            },
            updateOrSendMessage: async function (listener, message, resend = true) {
                if (listener.lastMessage && listener.channel.messages.cache.has(listener.lastMessage.id) && !listener.lastMessage.deleted) {
                    let keyArray = [...listener.channel.messages.cache.keys()];
                    if (keyArray.length - keyArray.indexOf(listener.lastMessage.id) < 15) {
                        listener.lastMessage.edit(message);
                        return false;
                    }
                }
                if (resend) {
                    try {
                        if (listener.lastMessage)
                            await listener.lastMessage.delete();
                        listener.lastMessage = await listener.channel.send(message);
                        await bot.database.updateLastMessage(listener.id, listener.lastMessage.id);
                    } catch (e) {
                        return true;
                    }
                }
                return false;
            },
            constructListener: async function constructListener(server, voiceChannel, channel, id) {
                bot.logger.log("Constructing listener for " + server);
                if(bot.lavaqueue.manager.idealNodes.length === 0){
                    return null;
                }
                let player = await bot.lavaqueue.manager.join({
                    guild: server.id,
                    channel: voiceChannel.id,
                    node: bot.util.arrayRand(bot.lavaqueue.manager.idealNodes).id,
                });
                bot.logger.log("Successfully joined voice channel");
                if (!id) {
                    bot.logger.log("Session is not resuming, creating new");
                    id = await bot.database.createMusicSession(server.id, voiceChannel.id, channel.id);
                    //let oldQueues = await bot.database.getPreviousQueue(server, id);
                    //if(oldQueues.length > 0)
                    //    channel.send(`:information_source: You have **${oldQueues.length}** previous queues stored. To restore or clear them, type ${channel.guild.getSetting("prefix")}music requeue`);
                }
                bot.logger.log("Creating listener");
                let listener = bot.music.listeners[server.id] = {
                    connection: player,
                    voteSkips: [],
                    queue: [],
                    server: server.id,
                    playing: null,
                    voiceChannel,
                    channel,
                    host: "",
                    id,
                    eventListener: function trackEvent(evt) {
                        bot.logger.log(`Event for listener ${listener.server}: ${JSON.stringify(evt)}`);
                        if (evt.type === "TrackEndEvent" && evt.reason !== "REPLACED") {
                            bot.logger.log(`Song for listener ${listener.server} has ended`);
                            bot.music.playNextInQueue(listener.server);
                            bot.lavaqueue.requestLeave(listener.voiceChannel, "Song has ended");
                        }
                    },
                    playerUpdateListener: function playerUpdate(evt) {
                        if (listener && listener.playing) {
                            bot.logger.log(`Listener update: (${listener.playing.info.title}) ${bot.util.shortSeconds(evt.state.position/1000)}`);
                            listener.playing.position = evt.state.position;
                        }
                    },
                    errorListener: function playerError(error) {
                        console.log(error);
                        if (error.error) {
                            listener.channel.send(":warning: " + error.error);
                            Sentry.captureException(error.error);
                            bot.music.playNextInQueue(listener.server);
                        } else if (error.reason && error.reason === "Closed by client") {
                            bot.lavaqueue.requestLeave(listener.voiceChannel, "Closed by client");
                        } else {
                            bot.lavaqueue.requestLeave(listener.voiceChannel, "Catastrophic failure");
                            listener.channel.send(":warning: Something has gone horribly wrong.");
                            listener.connection.removeListener("error", listener.errorListener);
                        }
                    }
                };
                bot.logger.log("Setting listener events")
                listener.connection.removeAllListeners("event");
                listener.connection.removeAllListeners("playerUpdate");
                listener.connection.removeAllListeners("error");
                listener.connection.on("event", listener.eventListener);
                listener.connection.on("playerUpdate", listener.playerUpdateListener);
                listener.connection.on("error", listener.errorListener);
                bot.logger.log("Listener was successfully created");
                return listener;
            },
            deconstructListener: async function (server) {
                bot.logger.log("Deconstructing listener " + server);
                const listener = bot.music.listeners[server];
                if (!listener) return bot.logger.warn(`Trying to deconstruct listener for server ${server} that does not exist.`);
                listener.connection.removeListener("event", listener.eventListener);
                listener.connection.removeListener("playerUpdate", listener.playerUpdateListener);
                listener.connection.removeListener("error", listener.errorListener);
                bot.logger.log("Requesting leave");
                bot.lavaqueue.requestLeave(listener.voiceChannel, "Listener was deconstructed");
                if (listener.checkInterval)
                    clearInterval(listener.checkInterval);
                if (listener.editInterval)
                    clearInterval(listener.editInterval);
                bot.music.listeners[server] = undefined;
                bot.logger.log("Ending music session " + listener.id);
                await bot.database.endMusicSession(listener.id);
            },
            playSong: function playSong(listener) {
                Sentry.configureScope(async function playSongScope(scope) {
                    try {
                        bot.logger.log("Attempting to play a song");
                        if (listener.playing.info.length <= 1000) {
                            bot.logger.log(`Song is ${listener.playing.info.length}ms long which is too short.`);
                            await listener.channel.sendLang("MUSIC_PLAY_SHORT");
                            return bot.music.playNextInQueue(listener.server);
                        }

                        bot.logger.log(`Updating now playing to be ${listener.playing.info.uri}`);
                        await bot.database.updateNowPlaying(listener.id, listener.playing.info.uri);

                        if (listener.checkInterval) {
                            bot.logger.log("Clearing check interval");
                            clearInterval(listener.checkInterval);
                        }

                        if (listener.playing.info.length >= 3.6e+6) { //1 hour
                            bot.logger.log(`Song is ${listener.playing.info.length}ms long which is over an hour long, so activate the inactive timer`);
                            listener.checkInterval = setInterval(async function checkInterval() {
                                bot.logger.log("Checking for inactivity");
                                if (listener.voiceChannel.members.size === 1) {
                                    bot.logger.log("Channel is inactive");
                                    await listener.channel.sendLang("MUSIC_PLAY_INACTIVE");
                                    if (listener && listener.connection) {
                                        bot.logger.log("Listener connection exists, so leave");
                                        await bot.lavaqueue.manager.leave(listener.server);
                                    }
                                    bot.logger.log("Deconstructing the listener " + listener.server);
                                    await bot.music.deconstructListener(listener.server);
                                }
                            }, 1.8e+6);
                        }
                        scope.addBreadcrumb({
                            message: "Song Played",
                            category: "Music",
                            data: {
                                track: listener.connection.track,
                                server: listener.server
                            }
                        });

                        bot.logger.log("Playing track")
                        listener.connection.play(listener.playing.track);
                        setTimeout(bot.lavaqueue.cancelLeave, 100, listener.voiceChannel);

                    } catch (e) {
                        bot.logger.error("Something bad happened");
                        console.error(e);
                        await bot.music.playNextInQueue(listener.server)
                    }
                })
            }
        };
    },
    handlePatchworkError({data, status}, context) {
        if (!data?.err){
            // Patchwork is probably completely dead
            if(!data || status >= 500)
                return context.sendLang({ephemeral: true, content: "MUSIC_ERROR_UNAVAILABLE"});
            return false
        }

        // Some random error from lavalink
        if(data.err.message)
            return context.sendLang({ephemeral: true, content: "MUSIC_ERROR_MESSAGE"}, data.err);

        switch(data.err){
            case "no results":
                return context.sendLang({ephemeral: true, content: "MUSIC_NO_RESULTS"});
            case "not ready":
                return context.sendLang({ephemeral: true, content: "MUSIC_ERROR_NOT_READY"});
            case "nothing playing":
                return context.sendLang({ephemeral: true, content: "MUSIC_NOTHING_PLAYING"});
            case "not permitted":
                return context.sendLang({ephemeral: true, content: data.requester ? "MUSIC_REMOVE_NOT_REQUESTER" : "MUSIC_LONE_ONLY"}, data);
            case "no item":
                return context.sendLang({ephemeral: true, content: "MUSIC_REMOVE_NO_ITEM"});
            case "queue empty":
                return context.sendLang({ephemeral: true, content: "MUSIC_QUEUE_EMPTY"});
            case "listener doesn't exist":
                return context.sendLang({ephemeral: true, content: "MUSIC_ERROR_LISTENER_GONE"});
            case "no nodes available":
                return context.sendLang({ephemeral: true, content: "MUSIC_ERROR_NO_NODES_AVAILABLE"});
            case "seek too far":
                return context.sendLang({
                    content: "MUSIC_SEEK_TOO_FAR",
                    components: [context.bot.util.actionRow(context.bot.interactions.suggestedCommand(context, "skip"))]
                });

        }
    }

};