/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/05/2019
 * ╚════ ║   (ocelotbotv5) voiceConnections
 *  ════╝
 */
module.exports = {
    name: "Voice Connections",
    usage: "voiceConnections",
    commands: ["vcs", "voiceconnections"],
    run: async function(message, args, bot){
       let connections = await bot.client.shard.fetchClientValues("voiceConnections.size");
       let output = "```\nActive Voice Connections:\n";
        for(let i = 0; i < connections.length; i++){
            output += `Shard ${i}: ${connections[i]}\n`;
        }
        output += "\n```";
        message.channel.send(output);

    }
};