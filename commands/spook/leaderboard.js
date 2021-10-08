const Strings = require("../../util/String");
const columnify = require('columnify');
module.exports = {
    name: "Leaderboard",
    usage: "leaderboard",
    commands: ["leaderboard", "lb"],
    run: async function (context, bot) {
        let data = await bot.database.getSpookLeaderboard();
        let position = -1;
        for(let i = 0; i < data.length; i++){
            if(data[i].server === context.guild.id){
                position = i;
                break;
            }
        }

        let output = "```asciidoc\n";
        if(position > -1)output = `This server is **#${position+1}** out of **${data.length}** with **${data[position].count}** spooks!\n${output}`

        let topTen = [];
        for(let i = 0; i < Math.min(10, data.length); i++) {
            const entry = data[i];
            let serverName = "Anonymous Guild";
            if(!bot.config.getBool(entry.server, "privacy.serverAnonymous")){
                let guild = await bot.client.guilds.fetch(entry.server).catch(()=>null);
                if(guild)serverName = Strings.Truncate(guild.name, 32);
            }

            topTen.push({
                "#": (i+1).toLocaleString(),
                server: serverName,
                spooks: entry.count,
            })
        }

        output += `${columnify(topTen)}\n\`\`\``
        return context.send(output);
    }
}
