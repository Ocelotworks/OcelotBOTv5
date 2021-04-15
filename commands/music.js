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

module.exports = {
    name: "Music Streaming",
    usage: "music help/play/skip",
    rateLimit: 10,
    categories: ["voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    premium: false,
    commands: ["music", "m"],
    subCommands: {},
    shuffleQueue: [],
    listeners: {},
    init: function init(fuckdamn) {
        //fuck you
        bot = fuckdamn;
        bot.util.standardNestedCommandInit('music');
        module.exports.populateShuffleQueue();

        bot.client.on("ready", function ready() {
            return;
            bot.lavaqueue.manager.on("ready", async function () {
                let activeSessions = await bot.database.getActiveSessions();
                for (let i = 0; i < activeSessions.length; i++) {
                    const session = activeSessions[i];
                    try {
                        if (bot.client.guilds.cache.has(session.server)) {
                            bot.logger.log(`Resuming session ${session.id}`);
                            const listener = await module.exports.constructListener(bot.client.guilds.cache.get(session.server), bot.client.channels.cache.get(session.voiceChannel), bot.client.channels.cache.get(session.textChannel), session.id);
                            listener.playing = await bot.lavaqueue.getSong(session.playing, listener.connection);
                            listener.autodj = session.autodj;
                            if (session.lastMessage) {
                                if (!listener.channel) return await bot.database.endMusicSession(session.id);
                                listener.lastMessage = await listener.channel.messages.fetch(session.lastMessage);
                                await module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), true);
                                if (listener.channel.guild.getBool("music.updateNowPlaying")) {
                                    listener.editInterval = setInterval(function updateNowPlaying() {
                                        if (module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), false))
                                            clearInterval(listener.editInterval);
                                    }, parseInt(listener.channel.guild.getSetting("music.updateFrequency")));
                                }
                            }
                            await module.exports.requeue(session, await bot.database.getQueueForSession(session.id));
                        }
                    } catch (e) {
                        Sentry.captureException(e);
                        await bot.database.endMusicSession(session.id);
                    }
                }
            })
        });
        bot.music = module.exports;
    },
    requeue: async function requeue(session, queue) {
        bot.logger.log("Populating queue with " + queue.length + " songs.");
        for (let i = 0; i < queue.length; i++) {
            let song = queue[i];
            await module.exports.addToQueue(session.server, song.uri, song.requester, false, song.id);
        }
    },
    run: function (message, args, bot) {
        if (!message.guild) return message.replyLang("GENERIC_DM_CHANNEL");
        bot.util.standardNestedCommand(message, args, bot, 'music', module.exports);
    },
    //shit
    _addToQueue: async function (listener, track, requester, next, id) {
        track.requester = requester;
        if (!id)
            track.id = await bot.database.queueSong(listener.id, track.info.uri, requester, next);
        else
            track.id = id;
        listener.queue[next ? "unshift" : "push"](track);
    },
    addToQueue: async function (server, search, requester, next = false, id) {
        let listener = module.exports.listeners[server];
        if (!listener) { // Not sure how we got here
            bot.logger.error("The bad things happened");
            console.log(module.exports.listeners);
            Sentry.setExtra("listeners", module.exports.listeners);
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
                await module.exports._addToQueue(listener, result.tracks[0], requester, next, id);
                obj = result.tracks[0].info;
                bot.logger.log(`Object is now: ${obj}`);
                break;
            case "PLAYLIST_LOADED":
                bot.logger.log("Playlist was successfully loaded");
                result.tracks.forEach(async (t) => await module.exports._addToQueue(listener, t, requester, next, id));
                obj = {
                    count: result.tracks.length,
                    name: result.playlistInfo.name,
                    duration: result.tracks.reduce((p, t) => p + t.info.length, 0)
                };
                break;
            default:
                console.warn("Unknown type " + result.loadType);
            case "LOAD_FAILED":
            case "NO_MATCHES":
                bot.logger.log("Load failed " + result.loadType);
                obj = null;
        }

        if (!listener.playing && !id) {
            bot.logger.log("Playing next in queue");
            module.exports.playNextInQueue(server);
        } else {
            bot.logger.log("Not playing now as something is playing or this is a session resume");
        }
        bot.logger.log("We actually got to the fucking end");
        return obj;
    },
    populateShuffleQueue: function populateShuffleQueue() {
        bot.logger.log("Populating shuffle queue");
        request("https://unacceptableuse.com/petify/templates/songs/shuffleQueue", function (err, resp, body) {
            if (!err && body) {
                try {
                    module.exports.shuffleQueue = JSON.parse(body);
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
            if (module.exports.shuffleQueue.length < 5)
                module.exports.populateShuffleQueue();
            let petifySong = module.exports.shuffleQueue.shift();

            if (!petifySong) {
                bot.logger.warn("Shits fucked");
                let songData = await bot.lavaqueue.getSong("https://unacceptableuse.com/petify/song/ecf0cfe1-a893-4594-b353-1dbd7063e241", player); //FUCK!
                songData.info.author = "Moloko";
                songData.info.title = "Moloko - The Time Is Now";
                fulfill(songData);
                module.exports.populateShuffleQueue();
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
        if (!module.exports.listeners[server]) {
            return bot.logger.warn(`Queue for ${server} is missing!`);
        }

        let listener = module.exports.listeners[server];
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
                newSong = await module.exports.getAutoDJSong(listener.connection);
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
        module.exports.playSong(listener);
        bot.logger.log("Sending update message");
        await module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener));

        if (listener.channel.guild.getBool("music.updateNowPlaying")) {
            listener.editInterval = setInterval(function updateNowPlaying() {
                if (module.exports.updateOrSendMessage(listener, module.exports.createNowPlayingEmbed(listener), false))
                    clearInterval(listener.editInterval);
            }, parseInt(listener.channel.guild.getSetting("music.updateFrequency")));
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
        return embed;
    },
    updateOrSendMessage: async function (listener, message, resend = true) {
        if (listener.lastMessage && listener.channel.messages.cache.has(listener.lastMessage.id) && !listener.lastMessage.deleted) {
            let keyArray = listener.channel.messages.cache.keyArray();
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
        let listener = module.exports.listeners[server.id] = {
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
                    module.exports.playNextInQueue(listener.server);
                    bot.lavaqueue.requestLeave(listener.voiceChannel, "Song has ended");
                }
            },
            playerUpdateListener: function playerUpdate(evt) {
                if (listener && listener.playing) {
                    bot.logger.log("Listener update: " + evt.state.position);
                    listener.playing.position = evt.state.position;
                }
            },
            errorListener: function playerError(error) {
                console.log(error);
                if (error.error) {
                    listener.channel.send(":warning: " + error.error);
                    Sentry.captureException(error.error);
                    module.exports.playNextInQueue(listener.server);
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
        const listener = module.exports.listeners[server];
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
        module.exports.listeners[server] = undefined;
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
                    return module.exports.playNextInQueue(listener.server);
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
                            await module.exports.deconstructListener(listener.server);
                        }
                    }, 1.8e+6);
                }
                scope.addBreadcrumb({
                    message: "Song Played",
                    category: "Music",
                    data: {
                        track: listener.connection.track,
                        server: listener.servert
                    }
                });

                bot.logger.log("Playing track")
                listener.connection.play(listener.playing.track);
                setTimeout(bot.lavaqueue.cancelLeave, 100, listener.voiceChannel);

            } catch (e) {
                listener.channel.stopTyping(true);
                bot.logger.error("Something bad happened");
                console.error(e);
                await module.exports.playNextInQueue(listener.server)
            }
            // bot.matomo.track({
            //     action_name: "Stream Song",
            //     uid:  listener.playing.requester,
            //     url: `http://bot.ocelotbot.xyz/stream`,
            //     ua: "Shard "+bot.client.shard_id,
            //     e_c: "Song",
            //     e_a: "Streamed",
            //     e_n: listener.playing.info.title,
            //     e_v: 1,
            //     cvar: JSON.stringify({
            //         1: ['Server ID', listener.server],
            //         2: ['Server Name', bot.client.guilds.cache.get(listener.server).name],
            //         3: ['Message', ""],
            //         4: ['Channel Name', listener.channel.name],
            //         5: ['Channel ID', listener.channel.id]
            //     })
            // });
        })
    }
};