/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 31/08/2019
 * ╚════ ║   (ocelotbotv5) lavaqueue
 *  ════╝
 */
const config = require('config');
const request = require('request');
const {Manager} = require('@lavacord/discord.js');
module.exports = {
    name: "LavaQueue",
    init: function (bot) {
        let firstReady = true;
        bot.client.on("ready", async function(){
            if(firstReady) {
                firstReady = false;
                const resumeKey = bot.client.user.id + "-" + bot.client.shard.id;
                let options =  {
                    resumeKey,
                    resumeTimeout: 60
                }
                bot.lavaqueue.manager = new Manager(bot.client, [
                    {
                        id: "1",
                        host: "lavalink-1.ocelot.xyz",
                        port: 2333,
                        password: config.get("Lavalink.password"),
                    },
                    {
                        id: "2",
                        host: "lavalink-2.ocelot.xyz",
                        port: 80,
                        password: config.get("Lavalink.password"),
                    }
                ], {
                    user: bot.client.user.id
                });

                try {
                    console.log("Connecting...");
                    await bot.lavaqueue.manager.connect();
                    console.log("Connected!");

                }catch(e){
                    console.log("Connect error!!!!");
                    console.log(e);
                }
                bot.lavaqueue.manager.on("error", function(node, error){
                    console.error("Node Error: ",error);
                })
            }
        });

        bot.lavaqueue = {};
        bot.lavaqueue.getSongs = async function getSongs(search, player) {
            return new Promise(function(fulfill, reject){
                console.log(player);

                const params = new URLSearchParams();
                params.append("identifier", search);
                request({url: `http://${player.node.host}:${player.node.port}/loadtracks?${params.toString()}`,  headers: { Authorization: player.node.password } }, function(err, resp, body){
                    if(err)
                        return reject(err);
                    try {
                        let data = JSON.parse(body);
                        fulfill(data);
                    }catch(e){
                        reject(e);
                    }
                })
            });
        };

        bot.lavaqueue.getSong = async function getSong(search, player) {
           return (await bot.lavaqueue.getSongs(search, player)).tracks[0];
        };

        bot.lavaqueue.leaveTimeouts = [];
        bot.lavaqueue.requestLeave = function requestLeave(channel, source){
            bot.logger.log("Requested leave for "+channel.id);
            if(bot.lavaqueue.leaveTimeouts[channel.id])
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            bot.tasks.endTask("voiceChannel", channel.id);
            bot.lavaqueue.leaveTimeouts[channel.id] = setTimeout(async function leaveVoiceChannel(){
                bot.logger.info("Leaving voice channel "+channel.id+" due to "+source);
                if(channel.guild) {
                    await bot.lavaqueue.manager.leave(channel.guild.id);
                   // let player = bot.lavaqueue.manager.players.get(channel.guild.id);
                    //await player.destroy();

                    if(bot.music){
                        bot.music.deconstructListener(channel.guild.id);
                    }
                }else {
                    bot.logger.warn("Tried to leave undefined voice channel");
                    console.log(channel);
                }
            }, 60000);
        };
        bot.lavaqueue.cancelLeave = function cancelLeave(channel){
            if(bot.lavaqueue.leaveTimeouts[channel.id]) {
                bot.logger.info("Leave cancelled bot "+channel.id);
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            }
        };

        bot.lavaqueue.playOneSong = async function playOneSong(voiceChannel, song){
            bot.lavaqueue.cancelLeave(voiceChannel);
            bot.tasks.startTask("playOneSong", voiceChannel.id);
            let player = await bot.lavaqueue.manager.join({
                guild: voiceChannel.guild.id,
                channel: voiceChannel.id,
                node: "1",
            });
            let songData = await bot.lavaqueue.getSong(song, player);
            player.play(songData.track);
            player.once("error", function playerError(error){
                bot.raven.captureException(error);
                bot.logger.error(error.error); //YEs
            });
            player.once("event", data => {
                if (!data.reason || data.reason === "REPLACED") return; // Ignore REPLACED reason to prevent skip loops
                console.log(data);
                bot.tasks.endTask("playOneSong", voiceChannel.id);
                bot.logger.log("Song ended");
                bot.lavaqueue.requestLeave(voiceChannel, "player playOneSong Song ended");
            });
            return {songData, player};
        };
    }
};