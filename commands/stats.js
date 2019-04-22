const Discord = require('discord.js');
module.exports = {
    name: "Stats",
    usage: "stats",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["stats", "statistics", "info", "about", "privacy"],
    categories: ["meta"],
    init: function(bot){
        bot.version = "stevie5";
    },
    run: async function run(message, args, bot){
        const server        = message.guild ? message.guild.id : "322032568558026753";
        const title         = await bot.lang.getTranslation(server, "STATS_VERSION", {version: bot.version});
        const tagline       = await bot.lang.getTranslation(server, "STATS_MESSAGE", {instance: `Shard ${bot.client.shard.id+1}/${bot.client.shard.count}`});
        const totalUsers    = await bot.lang.getTranslation(server, "STATS_TOTAL_USERS");
        const totalServers  = await bot.lang.getTranslation(server, "STATS_TOTAL_SERVERS");
        const totalChannels = await bot.lang.getTranslation(server, "STATS_TOTAL_CHANNELS");
        const uptime        = await bot.lang.getTranslation(server, "STATS_UPTIME");

        const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
        const userCount     = (await bot.client.shard.fetchClientValues("users.size")).reduce((prev, val) => prev + val, 0);
        const channelCount  = (await bot.client.shard.fetchClientValues("channels.size")).reduce((prev, val) => prev + val, 0);

        let embed = new Discord.RichEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor(title, bot.client.user.avatarURL);
        embed.setDescription(tagline);
        embed.addField(uptime, bot.util.prettySeconds(process.uptime()));
        embed.addField(totalUsers, userCount.toLocaleString(), true);
        embed.addField(totalServers, serverCount.toLocaleString(), true);
        embed.addField(totalChannels, channelCount.toLocaleString(), true);

        message.channel.send("", embed);
    }
};