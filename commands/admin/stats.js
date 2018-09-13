const Discord = require('discord.js');
module.exports = {
    name: "Stats",
    usage: "stats",
    commands: ["stats"],
    run: async function(message, args, bot){
        const stats = await bot.database.getDatabaseStats();

        let embed = new Discord.RichEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor("OcelotBOT Admin Stats", "https://cdn.discordapp.com/avatars/146293573422284800/1f37ae7298e956cc7bf671d745ae10ff.png?size=128");
        embed.addField("Total Servers Joined", stats.servers.toLocaleString(), true);
        embed.addField("Total Servers Left", stats.leftServers.toLocaleString(), true);
        embed.addField("Total Memes", stats.memes.toLocaleString(), true);
        embed.addField("Total Active Reminders", stats.reminders.toLocaleString(), true);
        embed.addField("Total Commands Run", stats.commands.toLocaleString(), true);
        embed.addField("Total Messages (This Shard & Session)", bot.stats.messagesTotal, true);
        embed.addField("Total Commands (This Shard & Session)", bot.stats.commandsTotal, true);

        message.channel.send("", embed);
    }
};