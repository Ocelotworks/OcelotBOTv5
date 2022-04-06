/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 31/08/2019
 * ╚════ ║   (ocelotbotv5) lavaqueue
 *  ════╝
 */
const config = require('config');
const dns = require('dns');
const {Manager} = require('@lavacord/discord.js');
const {axios} = require("../util/Http");


module.exports = {
    name: "LavaQueue",
    init: function (bot) {
        bot.client.once("ready", async function () {
            const resumeKey = bot.client.user.id + "-" + bot.util.shard;

            const clients = [];

            bot.lavaqueue.manager = new Manager(bot.client, clients, {
                user: bot.client.user.id,
            });

            bot.api.get("/lavalink/nodes", (req, res) => {
                res.json([...bot.lavaqueue.manager.nodes.values()].map((node)=>({
                    id: node.id,
                    host: node.host,
                    connected: node.connected,
                    stats: node.stats,
                    state: node.state,
                })));
            });

            bot.api.get("/lavalink/players", (req, res)=>{
                res.json([...bot.lavaqueue.manager.players.values()].map((player)=>({
                    id: player.id,
                    node: player.node.id,
                    track: player.track,
                    paused: player.paused,
                    playing: player.paused,
                    timestamp: player.timestamp,
                })));
            })

            await bot.lavaqueue.updateDockerContainers();

            try {
                bot.logger.log("Connecting...");
                await bot.lavaqueue.manager.connect();
                bot.logger.log("Connected!");

            } catch (e) {
                bot.logger.log("Connect error!!!!");
                bot.logger.log(e);
            }
            bot.lavaqueue.manager.on("error", function (node, error) {
                bot.logger.error("Node Error: ", error);
            });

            bot.lavaqueue.manager.players.forEach(function playerHarvest(player) {
                if (!player.playing) {
                    bot.logger.log(`Cleaning up stale player ${player.id} (${player.timestamp})`)
                    bot.lavaqueue.manager.leave(player.id);
                    player.removeAllListeners();
                    player.destroy();
                }
            });

            setInterval(() => {
                bot.lavaqueue.manager.nodes.forEach(async function nodeReconnect(node) {
                    if (!node.connected) {
                        bot.logger.log(`Attempting to connect node ${node.id}`);
                        try {
                            await node.connect();
                        } catch (e) {
                            bot.logger.error(`Error connecting to node ${node.id}: ${e}`)
                        }
                    }
                })

                bot.lavaqueue.updateDockerContainers();
            }, 300000);

        });

        bot.lavaqueue = {};
        bot.lavaqueue.getSongs = async function getSongs(search, player) {
                const params = new URLSearchParams();
                params.append("identifier", search);
                return bot.redis.cache(`lavaqueue/search/${search}`, async ()=>axios.get(`http://${player.node.host}:${player.node.port}/loadtracks?${params.toString()}`, {headers: {Authorization: player.node.password}}).then((r)=>r.data), 60000);
        };

        bot.lavaqueue.getSong = async function getSong(search, player) {
            return (await bot.lavaqueue.getSongs(search, player)).tracks?.[0];
        };

        bot.lavaqueue.leaveTimeouts = [];
        bot.lavaqueue.requestLeave = function requestLeave(channel, source) {
            bot.logger.log("Requested leave for " + channel.id);
            if (bot.lavaqueue.leaveTimeouts[channel.id])
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            bot.tasks.endTask("voiceChannel", channel.id);
            bot.lavaqueue.leaveTimeouts[channel.id] = setTimeout(async function leaveVoiceChannel() {
                bot.logger.info("Leaving voice channel " + channel.id + " due to " + source);
                if (channel.guild) {
                    await bot.lavaqueue.manager.leave(channel.guild.id);
                    // let player = bot.lavaqueue.manager.players.get(channel.guild.id);
                    //await player.destroy();

                    if (bot.music) {
                        bot.music.deconstructListener(channel.guild.id);
                    }
                } else {
                    bot.logger.warn("Tried to leave undefined voice channel");
                    console.log(channel);
                }
            }, 60000);
        };
        bot.lavaqueue.cancelLeave = function cancelLeave(channel) {
            if (bot.lavaqueue.leaveTimeouts[channel.id]) {
                bot.logger.info("Leave cancelled bot " + channel.id);
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            }
        };

        bot.lavaqueue.playOneSong = async function playOneSong(voiceChannel, song, node) {
            // if(voiceChannel.guild && voiceChannel.guild.id === "622757587489914880")
            //    song = "https://cdn.discordapp.com/attachments/626353784888754177/767805301260025896/websdr_recording_start_2020-10-19T17_41_42Z_7055.0kHz.wav";
            bot.lavaqueue.cancelLeave(voiceChannel);
            if(!node)node = bot.util.arrayRand(bot.lavaqueue.manager.idealNodes).id;
            bot.tasks.startTask("playOneSong", voiceChannel.id);
            let span = bot.util.startSpan("Join Voice Channel", "voice");
            let player = await bot.lavaqueue.manager.join({
                guild: voiceChannel.guild.id,
                channel: voiceChannel.id,
                node,
            }, {selfdeaf: true});
            if (span)
                span.end();
            span = bot.util.startSpan("Get Song", "voice");
            let songData = await bot.lavaqueue.getSong(song, player);
            if (span)
                span.end();
            span = bot.util.startSpan("Play Song", "voice");
            player.play(songData.track);
            if (span)
                span.end();
            player.once("error", function playerError(error) {
                bot.raven.addBreadcrumb({
                    message: "Player Error",
                    data: error,
                })
                if(error.error){
                    bot.raven.captureException(error.error);
                }else{
                    bot.raven.captureMessage(`Player error: ${error.reason}`);
                }
                bot.logger.error("Player Error: " + error.error); //YEs

            });
            player.once("event", data => {
                if (!data.reason || data.reason === "REPLACED") return; // Ignore REPLACED reason to prevent skip loops
                bot.tasks.endTask("playOneSong", voiceChannel.id);
                bot.logger.log("Song ended");
                bot.lavaqueue.requestLeave(voiceChannel, "player playOneSong Song ended");
            });
            return {songData, player};
        };

        bot.lavaqueue.updateDockerContainers = async function () {
            try {
                let dockerHosts = await dns.promises.resolve("tasks.lavalink_lavalink", "A")

                bot.lavaqueue.manager.nodes.forEach((connectedNode) => {
                    if (connectedNode.id.startsWith("docker-") && !dockerHosts.includes(connectedNode.id.split("-")[1])) {
                        bot.logger.log(`Node ${connectedNode.id} doesn't exist anymore.`);
                        const removed = bot.lavaqueue.manager.nodes.delete(connectedNode.id);
                        if(!removed)
                            bot.logger.log(`Node was not removed! ${connectedNode.id}, ${dockerHosts}`);
                    }
                })


                dockerHosts.forEach((host) => {
                    if (!bot.lavaqueue.manager.nodes.has(`docker-${host}`)) {
                        bot.logger.log(`Discovered new node docker-${host}`);
                        bot.lavaqueue.manager.createNode({
                            id: `docker-${host}`,
                            host,
                            port: 2333,
                            password: config.get("Lavalink.password"),
                            reconnectInterval: 1000,
                        })
                    }
                });
            } catch (e) {
                if (e.code !== "ENOTFOUND")
                    console.error(e);
            }
        }
    }
};