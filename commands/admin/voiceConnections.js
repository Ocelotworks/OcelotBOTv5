/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/05/2019
 * ╚════ ║   (ocelotbotv5) voiceConnections
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "Voice Connections",
    usage: "voiceConnections",
    commands: ["vcs", "voiceconnections"],
    run: async function(message, args, bot){
        let formatted = [];
        bot.lavaqueue.manager.nodes.forEach(function(node, host){
            formatted.push({
                "host ::": host+" ::",
                ready: node.ready ? "✔": "✖",
                playing: node.stats.playingPlayers,
                total: node.stats.players
            });
        });
        message.channel.send(`\`\`\`asciidoc\n${columnify(formatted)}\n\`\`\``);
    }
};