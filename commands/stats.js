const Discord = require('discord.js');
const Util = require("../util/Util");
const Embeds = require("../util/Embeds");
const {axios} = require("../util/Http");
const shardNames = [
    "Remo.tv",
    "Alexis",
    "Sexy Trap Wife",
    "Wankish",
    "Wiking",
    "Thatgirlpossessed",
    "Anex TTT",
    "Zucc",
    "King Viking",
    "S1othy",
    "Marco",
    "sunny",
    "smirkstudios",
    "Gnome Fire",
    "Litchfield",
    "orchid",
    "Prince Ali, Fabulous He",
    "Seegee",
    "Scotty",
    "Fay",
    "crybaby",
    "nicole",
    "Massive Effect",
    "Maxmarval",
    "Cables",
];
module.exports = {
    name: "Stats",
    usage: "stats",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["stats", "statistics", "info", "about"],
    categories: ["meta"],
    run: async function run(context, bot) {
        if(context.args && context.args[1] && context.args[1] === "watson"){
            return context.send(`${context.args[2]}|${JSON.stringify({
                version: bot.version,
                podUptime: process.uptime(),
                shard: bot.util.shard,
            })}`);
        }
        let serverCount = 0;
        let userCount = 0;
        let channelCount = 0;
        try {
            const domain = await Util.GetSecret("COLLECTOR_API_URL");
            const {data} = await axios.get(`${domain}/discord`);
            const shards = Object.keys(data);
            for(let i = 0; i < shards.length; i++){
                const shard = data[shards[i]][0];
                if(!shard)continue;
                serverCount+=shard.guilds || 0;
                userCount+=shard.users || 0;
                channelCount+=shard.channels || 0;
            }
        }catch(e){
            bot.raven.captureException(e);
        }
        let uptimeValue = bot.util.prettySeconds(process.uptime(), context.guild && context.guild.id, context.user.id);
        let embed = new Embeds.LangEmbed(context)
        embed.setColor(0x189F06);
        embed.setAuthorLang("STATS_VERSION", {version: bot.version}, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}))
        embed.setDescriptionLang("STATS_MESSAGE", {
            name: shardNames[bot.util.shard] || context.getLang("STATS_SHARD_UNNAMED"),
            id: bot.util.shard + 1,
            total: process.env.SHARD_COUNT,
            year: new Date().getFullYear(),
            instance: `${bot.util.shard + 1}/${process.env.SHARD_COUNT}` // Backwards compatibility with other languages
        });
        embed.addFieldLang("STATS_SPONSOR_TITLE", "STATS_SPONSOR_VALUE");
        embed.addFieldLang("STATS_UPTIME", "STATS_UPTIME_VALUE", false, {uptime: uptimeValue});
        if(userCount > 0)
            embed.addFieldLang("STATS_TOTAL_USERS", "STATS_TOTAL_USERS_VALUE", true, {users: userCount});
        if(serverCount > 0)
            embed.addFieldLang("STATS_TOTAL_SERVERS", "STATS_TOTAL_SERVERS_VALUE", true,{servers: serverCount});
        if(channelCount > 0)
            embed.addFieldLang("STATS_TOTAL_CHANNELS", "STATS_TOTAL_CHANNELS_VALUE", true,{channels: channelCount});
        return context.send({embeds: [embed]});
    }
};
