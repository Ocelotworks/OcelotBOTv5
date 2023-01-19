/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/05/2019
 * ╚════ ║   (ocelotbotv5) voiceConnections
 *  ════╝
 */
const {axios} = require("../../util/Http");
const Strings = require("../../util/String");
module.exports = {
    name: "Lavalink",
    usage: "lavalink",
    commands: ["ll", "lavalink"],
    slashHidden: true,
    run: async function (context, bot) {
        const {data} = await axios.get("https://ob-prod-sc.d.int.unacc.eu/lavalink/players");
        const shards = Object.keys(data);
        let output = shards.flatMap((shardNum)=>{
            const shardData = data[shardNum].flat();
            return shardData.map((shard)=>`  ${shardNum}: ${shard.paused ? "paused".red : "playing".green} ${shard.playing ? "active".green : "idle".dim}`);
        });

        let patchworkWorkers = Math.floor(parseInt(process.env.PATCHWORK_SHARD_COUNT)/10)+1;

        for (let i = 1; i <= patchworkWorkers; i++){
            try {
                let {data} = await axios.get(`http://patchwork-${process.env.BOT_ID}-${i}:8008/lavalink/players`);
                output.concat(data.map((shard) => `PW${i}: ${shard.paused ? "paused".red : "playing".green} ${shard.playing ? "active".green : "idle".dim}`));
            }catch(e){
                output.push(`Patchwork ${i} failed (${Strings.Truncate(e.message, 256)})`);
            }
        }

        return context.send({content: `${output.length} players:\n\`\`\`ansi\n${output.join("\n")}\n\`\`\``});
    }
};