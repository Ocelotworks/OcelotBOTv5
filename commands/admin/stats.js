const os = require("os");
module.exports = {
    name: "Shard Stats",
    usage: "stats",
    commands: ["stats"],
    run: async function (context, bot) {
        let stats = {
            "Docker Host": process.env.DOCKER_HOST,
            "Container": os.hostname(),
            "Shard": bot.util.shard,
            "Version": bot.version,
            "Patchwork Host": context.guild ? await bot.util.getPatchworkHost(context.guild.id) : "N/A",
            "CockroachDB Host":  bot.database.knockroach?.context?.client?.config?.connection?.host || "N/A",
            "Custom Commands Host":  process.env.CUSTOM_COMMANDS_URL || "http://ob-sat_custom-commands:3000/run",
            "Uptime": process.uptime()+"s",
            "Connection Uptime": bot.client.uptime+"ms",
            "Ping": bot.client.ws.ping+"ms",

        }

        let content = "```ansi\n";
        let keys = Object.keys(stats);

        let paddingLength = 0;
        for(let key of keys){
            if(paddingLength < key.length)paddingLength = key.length;
        }

        for(let key of keys){
            content += `${key.padEnd(paddingLength)} ${stats[key].toString().red}\n`
        }
        content += "\n```"
        context.send({
            content
        });
    }
};