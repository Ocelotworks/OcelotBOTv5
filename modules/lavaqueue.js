/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 31/08/2019
 * ╚════ ║   (ocelotbotv5) lavaqueue
 *  ════╝
 */
const {Client: Lavaqueue} = require('lavaqueue');
const Redis = require("ioredis");
const config = require('config');
module.exports = {
    name: "LavaQueue",
    init: function (bot) {
        bot.lavaqueue = new Lavaqueue({
            userID: config.get("Lavalink.user"),
            password: config.get("Lavalink.password"),
            shardCount: bot.client.shard.count,
            hosts: {
                rest: config.get("Lavalink.rest"),
                ws: config.get("Lavalink.ws"),
                redis: new Redis(config.get("Redis.host"))
            },
            send: function(guildID, packet){
                console.log("Got packet", packet);
                console.log(bot.client.ws.connection);
                bot.client.ws.connection.ws.send(JSON.stringify(packet));
                return Promise.resolve();
            }
        });

        console.log(bot.lavaqueue);

        bot.lavaqueue.on('event', (d) => {
            console.log('track ended!', d);
        });

       // console.log(bot.client);

        bot.client.ws.on("VOICE_STATE_UPDATE", function voiceStateUpdate(state){
            bot.logger.log("Voice state update"+state);

        });

        bot.client.on("raw", function(packet){
            switch(packet.t){
                case "VOICE_SERVER_UPDATE":
                    bot.lavaqueue.voiceServerUpdate(packet.d);
                    break;
                case "VOICE_STATE_UPDATE":
                    bot.lavaqueue.voiceStateUpdate(packet.d);
                    break;
                case "GUILD_CREATE":
                    for (const state of packet.d.voice_states) bot.lavaqueue.voiceStateUpdate(state);
                    break;
            }
        });

        bot.client.ws.on("VOICE_SERVER_UPDATE", function voiceServerUpdate(info){
            bot.logger.log("Voice server update"+info);
            bot.lavaqueue.voiceServerUpdate(info);
        });

        bot.client.ws.on("GUILD_CREATE", function voiceServerUpdate(guild){
            bot.logger.log("Guild create"+guild);

        });

        bot.client.on("ready", async function lqTest(){
            const res = await bot.lavaqueue.load('ytsearch:lofi music');
            const queue = bot.lavaqueue.queues.get("322032568558026753");
            await queue.player.join("336995004419407872");
            console.log(res);
            await queue.add(...res.tracks.map(s => s.track));
            console.log("Added");
            await queue.start();
            console.log("Started");
        });


    }
};