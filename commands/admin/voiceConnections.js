/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/05/2019
 * ╚════ ║   (ocelotbotv5) voiceConnections
 *  ════╝
 */
const encoding = require('@lavalink/encoding');
const columnify = require('columnify');
module.exports = {
    name: "Voice Connections",
    usage: "voiceConnections",
    commands: ["vcs", "voiceconnections"],
    run: async function (message, args, bot) {
        let nodes = [];
        let players = [];
        bot.lavaqueue.manager.nodes.forEach(function (node, host) {
            nodes.push({
                "host ::": node.host + " ::",
                id: node.id,
                ready: node.connected ? "✔" : "✖",
                playing: node.stats.playingPlayers,
                total: node.stats.players,
                memory: bot.util.prettyMemory(node.stats.memory.used),
                cpu: node.stats.cpu.lavalinkLoad.toFixed(2),
            });
        });
        bot.lavaqueue.manager.players.forEach((player) => {

            const track = player.track && encoding.decode(player.track);
            players.push({
                "guild ::": player.id,
                host: player.node.id,
                state: player.paused ? "⏸️" : player.playing ? "▶️" : "⏹️",
                track: track ? track.source === 'local' ? track.uri : track.title : "",
            })
        });
        message.channel.send(`Nodes:\n\`\`\`asciidoc\n${columnify(nodes)}\n\`\`\`\nThis shard:\n\`\`\`asciidoc\n${players.length ? columnify(players) : "Nothing playing."}\n\`\`\``);
    }
};