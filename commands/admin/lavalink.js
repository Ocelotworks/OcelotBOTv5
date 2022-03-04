/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/05/2019
 * ╚════ ║   (ocelotbotv5) voiceConnections
 *  ════╝
 */
const encoding = require('@lavalink/encoding');
const columnify = require('columnify');
const {axios} = require("../../util/Http");
module.exports = {
    name: "Lavalink",
    usage: "lavalink",
    commands: ["ll", "lavalink"],
    run: async function (context, bot) {
        const {data} = await axios.get("https://ob-prod-sc.d.int.unacc.eu/lavalink/players");
        const shards = Object.keys(data);
        let output = shards.flatMap((shardNum)=>{
            const shardData = data[shardNum].flat();
            return shardData.map((shard)=>`${shardNum}: ${shard.paused ? "paused".red : "playing".green} ${shard.playing ? "active".green : "idle".dim}`);
        })

        return context.send({content: `${output.length} players:\n\`\`\`ansi\n${output.join("\n")}\n\`\`\``});
    }
};