const Discord = require('discord.js');
const Util = require("../util/Util");
const Embeds = require("../util/Embeds");
const shardNames = [
    "Remo.tv",
    "shart",
    "Sexy Trap Wife",
    "Wankish",
    "Wiking",
    "cursed_shard",
    "Anex TTT",
    "blessed_shard",
    "King Viking",
    "S1othy",
    "Omz",
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
            serverCount = await Util.GetServerCount(bot);
            userCount = (await bot.rabbit.fetchClientValues("users.cache.size")).reduce((prev, val) => prev + val, 0);
            channelCount = (await bot.rabbit.fetchClientValues("channels.cache.size")).reduce((prev, val) => prev + val, 0);
        } catch (e) {
            bot.raven.captureException(e);
            if (e.message && e.message.includes("Channel closed")) {
                process.exit(1)
            }
        }

        let uptimeValue = bot.util.prettySeconds(process.uptime(), context.guild && context.guild.id, context.user.id);
        try{
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            const watsonResult = await bot.util.getJson("https://ob-watson.d.int.unacc.eu/");
            if(watsonResult && watsonResult.uptimes && watsonResult.uptimes[bot.client.user.id]){
                const uptime = watsonResult.uptimes[bot.client.user.id];
                const downtime = watsonResult.downtimes[bot.client.user.id] || 0;
                const upSince = watsonResult.lastChanges[bot.client.user.id];
                const upSeconds = ((new Date())-(new Date(upSince)))/1000
                uptimeValue = `${bot.util.prettySeconds(upSeconds, context.guild && context.guild.id, context.user.id)} (${((uptime/(uptime+downtime))*100).toFixed(2)}% Uptime)`;
            }
        }catch(e){
            bot.logger.error(e);
        }

        let embed = new Embeds.LangEmbed(context)
        embed.setColor(0x189F06);
        embed.setAuthorLang("STATS_VERSION", {version: bot.version}, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}))
        embed.setDescriptionLang("STATS_MESSAGE", {
            name: shardNames[bot.util.shard] || context.getLang("STATS_SHARD_UNNAMED"),
            id: bot.util.shard + 1,
            total: process.env.SHARD_COUNT,
            instance: `${bot.util.shard + 1}/${process.env.SHARD_COUNT}` // Backwards compatibility with other languages
        });
        embed.addFieldLang("STATS_SPONSOR_TITLE", "STATS_SPONSOR_VALUE");
        embed.addFieldLang("STATS_UPTIME", "STATS_UPTIME_VALUE", {uptime: uptimeValue});
        embed.addFieldLang("STATS_TOTAL_USERS", "STATS_TOTAL_USERS_VALUE", {users: userCount.toLocaleString()}, true);
        embed.addFieldLang("STATS_TOTAL_SERVERS", "STATS_TOTAL_SERVERS_VALUE", {servers: serverCount.toLocaleString()}, true);
        embed.addFieldLang("STATS_TOTAL_CHANNELS", "STATS_TOTAL_CHANNEL_VALUE", {channel: channelCount.toLocaleString()}, true);
        return context.send({embeds: [embed]});
    }
};
