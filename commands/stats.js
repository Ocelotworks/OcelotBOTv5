const Discord = require('discord.js');
module.exports = {
    name: "Stats Command",
    usage: "stats",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["stats", "statistics", "info", "about", "privacy"],
    init: function(bot){
        bot.version = "stevie5";
    },
    run: async function run(message, args, bot){
        const server        = message.guild.id;
        const title         = await bot.lang.getTranslation(server, "STATS_VERSION", bot.version);
        const tagline       = await bot.lang.getTranslation(server, "STATS_MESSAGE", {instance: `Shard ${bot.client.shard.id+1}/${bot.client.shard.count}`});
        const totalUsers    = await bot.lang.getTranslation(server, "STATS_TOTAL_USERS");
        const totalServers  = await bot.lang.getTranslation(server, "STATS_TOTAL_SERVERS");
        const uptime        = await bot.lang.getTranslation(server, "STATS_UPTIME");

        const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
        const userCount     = (await bot.client.shard.fetchClientValues("users.size")).reduce((prev, val) => prev + val, 0);


        let embed = new Discord.RichEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor(title, "https://cdn.discordapp.com/avatars/146293573422284800/1f37ae7298e956cc7bf671d745ae10ff.png?size=128");
        embed.setDescription(tagline);
        embed.addField(uptime, bot.util.prettySeconds(process.uptime()));
        embed.addField(totalUsers, userCount, true);
        embed.addField(totalServers, serverCount, true);


        message.channel.send("", embed);
    }
};