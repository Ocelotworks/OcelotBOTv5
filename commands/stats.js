const Discord = require('discord.js');
const shardNames = [
    "Remo.tv",
    "Let's Robot",
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
    "smirkstudios"
];
module.exports = {
    name: "Stats",
    usage: "stats",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["stats", "statistics", "info", "about", "privacy"],
    categories: ["meta"],
    run: async function run(message, args, bot){
        console.log("lang");
        const title         = await message.getLang("STATS_VERSION", {version: bot.version});
        const tagline       = await message.getLang("STATS_MESSAGE", {instance: `Shard ${shardNames[bot.client.shard.ids.join(";")] ? "'"+shardNames[bot.client.shard.ids.join(";")]+"'" : "Unnamed"} (${bot.client.shard.ids.join(";")}/${bot.client.shard.count})`});
        const totalUsers    = await message.getLang("STATS_TOTAL_USERS");
        const totalServers  = await message.getLang("STATS_TOTAL_SERVERS");
        const totalChannels = await message.getLang("STATS_TOTAL_CHANNELS");
        const uptime        = await message.getLang("STATS_UPTIME");
        console.log("counts");
        let serverCount = 0;
        let userCount = 0;
        let channelCount = 0;
        try {
            serverCount = (await bot.client.shard.fetchClientValues("guilds.cache.size")).reduce((prev, val) => prev + val, 0);
            userCount = (await bot.client.shard.fetchClientValues("users.cache.size")).reduce((prev, val) => prev + val, 0);
            channelCount = (await bot.client.shard.fetchClientValues("channels.cache.size")).reduce((prev, val) => prev + val, 0);
        }catch(e){
            bot.raven.captureException(e);
            if(e.message && e.message.includes("Channel closed")){
                process.exit(1)
            }
        }
        console.log("create embed");

        let embed = new Discord.MessageEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor(title, bot.client.user.avatarURL({dynamic: true, format: "png"}));
        embed.setDescription(tagline);
        embed.addField("Sponsor a Shard","Give this shard a name with [OcelotBOT Premium](https://ocelot.xyz/premium)");
        embed.addField(uptime, bot.util.prettySeconds(process.uptime(), message.guild && message.guild.id, message.author.id));
        embed.addField(totalUsers, userCount.toLocaleString(), true);
        embed.addField(totalServers, serverCount.toLocaleString(), true);
        embed.addField(totalChannels, channelCount.toLocaleString(), true);
        console.log("send");
        return message.channel.send("", embed);
    }
};
