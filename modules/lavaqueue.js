/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 31/08/2019
 * ╚════ ║   (ocelotbotv5) lavaqueue
 *  ════╝
 */
const {PlayerManager} = require("discord.js-lavalink");
const config = require('config');
const request = require('request');
module.exports = {
    name: "LavaQueue",
    init: function (bot) {
        bot.client.on("ready", function(){
            bot.lavaqueue.manager = new PlayerManager(bot.client,  [
                {host: "boywanders.us", port: 2333, password: config.get("Lavalink.password")},
                {host: "lava-backup.ocelot.xyz", port: 2333, password: config.get("Lavalink.password")}
                ], {user: bot.client.user.id, shards: bot.client.shard.count});
        });

        bot.lavaqueue = {};
        bot.lavaqueue.getSongs = async function getSongs(search) {
            return new Promise(function(fulfill, reject){
                const node = bot.lavaqueue.manager.nodes.first();

                const params = new URLSearchParams();
                params.append("identifier", search);
                request({url: `http://${node.host}:${node.port}/loadtracks?${params.toString()}`,  headers: { Authorization: node.password } }, function(err, resp, body){
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
        bot.lavaqueue.requestLeave = function requestLeave(channel){
            bot.logger.log("Requested leave for "+channel.id);
            if(bot.lavaqueue.leaveTimeouts[channel.id])
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            bot.lavaqueue.leaveTimeouts[channel.id] = setTimeout(async function leaveVoiceChannel(){
                bot.logger.log("Leaving voice channel "+channel.id);
                if(channel.guild)
                    await bot.lavaqueue.manager.leave(channel.guild.id);
                else {
                    bot.logger.warn("Tried to leave undefined voice channel");
                    console.log(channel);
                }
            }, 60000);
        };
        bot.lavaqueue.cancelLeave = function cancelLeave(channel){
            if(bot.lavaqueue.leaveTimeouts[channel.id]) {
                bot.logger.log("Leave cancelled bot "+channel.id);
                clearTimeout(bot.lavaqueue.leaveTimeouts[channel.id]);
            }
        };

        bot.lavaqueue.playOneSong = async function playOneSong(voiceChannel, song){
            bot.lavaqueue.cancelLeave(voiceChannel);
            const player = await bot.lavaqueue.manager.join({
                guild: voiceChannel.guild.id, // Guild id
                channel:  voiceChannel.id, // Channel id
                host: "boywanders.us" // lavalink host, based on array of nodes
            }, {selfdeaf: true});
            let songData = await bot.lavaqueue.getSong(song);
            player.play(songData.track);
            player.once("error", function playerError(error){
                bot.raven.captureException(error);
                bot.logger.error(error.error); //YEs
            });
            player.once("end", data => {
                if (data.reason === "REPLACED") return; // Ignore REPLACED reason to prevent skip loops
                bot.logger.log("Song ended");
                bot.lavaqueue.requestLeave(voiceChannel);
            });
            return {songData, player};
        };
    }
};