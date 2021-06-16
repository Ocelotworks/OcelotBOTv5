const Discord = require('discord.js');
const shardNames = [
    "Remo.tv",
    "shart",
    "Sexy Trap Wife",
    "Autistic",
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
        const title = await context.getLang("STATS_VERSION", {version: bot.version});
        const tagline = await context.getLang("STATS_MESSAGE", {instance: `Shard ${shardNames[bot.util.shard] ? "'" + shardNames[bot.util.shard] + "'" : "Unnamed"} (${bot.util.shard + 1}/${process.env.SHARD_COUNT})`});
        const totalUsers = await context.getLang("STATS_TOTAL_USERS");
        const totalServers = await context.getLang("STATS_TOTAL_SERVERS");
        const totalChannels = await context.getLang("STATS_TOTAL_CHANNELS");
        const uptime = await context.getLang("STATS_UPTIME");
        let serverCount = 0;
        let userCount = 0;
        let channelCount = 0;
        try {
            serverCount = (await bot.rabbit.fetchClientValues("guilds.cache.size")).reduce((prev, val) => prev + val, 0);
            userCount = (await bot.rabbit.fetchClientValues("users.cache.size")).reduce((prev, val) => prev + val, 0);
            channelCount = (await bot.rabbit.fetchClientValues("channels.cache.size")).reduce((prev, val) => prev + val, 0);
        } catch (e) {
            bot.raven.captureException(e);
            if (e.message && e.message.includes("Channel closed")) {
                process.exit(1)
            }
        }

        let uptimeValue = bot.util.prettySeconds(process.uptime(), message.guild && message.guild.id, message.author.id);
        try{
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            const watsonResult = await bot.util.getJson("https://ob-watson.d.int.unacc.eu/");
            if(watsonResult && watsonResult.uptimes && watsonResult.uptimes[bot.client.user.id]){
                const uptime = watsonResult.uptimes[bot.client.user.id];
                const downtime = watsonResult.downtimes[bot.client.user.id] || 0;
                const upSince = watsonResult.lastChanges[bot.client.user.id];
                const upSeconds = ((new Date())-(new Date(upSince)))/1000
                uptimeValue = `${bot.util.prettySeconds(upSeconds, message.guild && message.guild.id, message.author.id)} (${((uptime/(uptime+downtime))*100).toFixed(2)}% Uptime)`;
            }
        }catch(e){
            bot.logger.error(e);
        }

        let embed = new Discord.MessageEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor(title, bot.client.user.displayAvatarURL({dynamic: true, format: "png"}));
        embed.setDescription(tagline);
        embed.addField("Sponsor a Shard", "Give this shard a name with [OcelotBOT Premium](https://ocelotbot.xyz/premium)");
        embed.addField(uptime, uptimeValue);
        embed.addField(totalUsers, userCount.toLocaleString(), true);
        embed.addField(totalServers, serverCount.toLocaleString(), true);
        embed.addField(totalChannels, channelCount.toLocaleString(), true);
        return context.send({embeds: [embed]});
    }
};
