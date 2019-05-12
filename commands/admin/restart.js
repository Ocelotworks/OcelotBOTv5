/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) restart
 *  ════╝
 */
module.exports = {
    name: "Restart",
    usage: "restart",
    commands: ["restart", "respawn"],
    run: async function(message, args, bot){
        message.channel.send("Respawning all Shards...");
        bot.client.shard.send({type: "respawn"});
    }
};