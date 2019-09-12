/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 31/08/2019
 * ╚════ ║   (ocelotbotv5) lavaqueue
 *  ════╝
 */
const config = require('config');
const request = require('request');
const {NodeManager} = require('@lavalink/discord.js');
module.exports = {
    name: "LavaQueue",
    init: function (bot) {
        bot.client.on("ready", function(){
            const resumeKey = bot.client.user.id+"-"+bot.client.shard.id;
            bot.lavaqueue.manager = new NodeManager(bot.client, {
                userID: bot.client.user.id,
                shardCount: bot.client.shard.count,
                password: config.get("Lavalink.password"),
                hosts: {
                    rest: "http://boywanders.us:2333",
                    ws: {
                        url: "http://boywanders.us:2333",
                        options: {
                            resumeKey,
                            resumeTimeout: 60
                        }
                    }
                }
            });
        });

        bot.lavaqueue = {};
        bot.lavaqueue.getSongs = async function getSongs(search) {
            return new Promise(function(fulfill, reject){
                const node = bot.lavaqueue.manager;

                const params = new URLSearchParams();
                params.append("identifier", search);
                request({url: `http://boywanders.us:2333/loadtracks?${params.toString()}`,  headers: { Authorization: node.password } }, function(err, resp, body){
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

        bot.lavaqueue.getSong = async function getSong(search) {
           return (await bot.lavaqueue.getSongs(search)).tracks[0];
        };

        bot.lavaqueue.leaveTimeouts = [];
        bot.lavaqueue.requestLeave = function requestLeave(channel, source){
            bot.logger.log("Requested leave for "+channel.id);
            if(bot.lavaqueue.leaveTimeouts[channel.id])
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            bot.lavaqueue.leaveTimeouts[channel.id] = setTimeout(async function leaveVoiceChannel(){
                bot.logger.info("Leaving voice channel "+channel.id+" due to "+source);
                if(channel.guild) {
                    let player = bot.lavaqueue.manager.players.get(channel.guild.id);
                    await player.leave();
                    await player.destroy();

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
            let player = bot.lavaqueue.manager.players.get(voiceChannel.guild.id);
            await player.join(voiceChannel.id);
            let songData = await bot.lavaqueue.getSong(song);
            player.play(songData.track);
            player.once("error", function playerError(error){
                bot.raven.captureException(error);
                bot.logger.error(error.error); //YEs
            });
            player.once("event", data => {
                if (data.reason === "REPLACED") return; // Ignore REPLACED reason to prevent skip loops
                bot.logger.log("Song ended");
                bot.lavaqueue.requestLeave(voiceChannel, "player playOneSong Song ended");
            });
            return {songData, player};
        };
    }
};