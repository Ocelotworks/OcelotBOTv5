const Strings = require("../../util/String");
const {Leaderboard} = require("../../util/Util");
module.exports = {
    name: "Leaderboard",
    usage: "leaderboard",
    commands: ["leaderboard", "lb"],
    run: async function (context, bot) {
        let data = await bot.database.getSpookLeaderboard();
        let {output, position} = await Leaderboard(data, context.guild.id, "server", async (entry, i)=>{
            let serverName = "Anonymous Guild";
            if(!bot.config.getBool(entry.server, "privacy.serverAnonymous")){
                let guild = await bot.client.guilds.fetch(entry.server).catch(()=>null);
                if(guild)serverName = Strings.Truncate(guild.name, 32);
            }

            return {
                "#": (i+1).toLocaleString(),
                server: serverName,
                spooks: entry.count,
            }
        })
        if(position > -1)output = `This server is **#${position+1}** out of **${data.length}** with **${data[position].count}** spooks!\n${output}`
        return context.send(output);
    }
}
