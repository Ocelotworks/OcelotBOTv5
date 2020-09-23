const Discord = require('discord.js');
const exec = require('child_process').exec;
module.exports = {
    name: "Stats",
    usage: "stats",
    commands: ["stats"],
    run: async function(message, args, bot){
        const now = new Date();
        const stats = await bot.database.getDatabaseStats();
        let embed = new Discord.MessageEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor("OcelotBOT Admin Stats", "https://cdn.discordapp.com/avatars/146293573422284800/1f37ae7298e956cc7bf671d745ae10ff.png?size=128");
        embed.addField("Total Servers Joined", stats.servers.toLocaleString(), true);
        embed.addField("Total Servers Left", stats.leftServers.toLocaleString(), true);
        embed.addField("Total Memes", stats.memes.toLocaleString(), true);
        embed.addField("Total Active Reminders", stats.reminders.toLocaleString(), true);
        embed.addField("Total Commands Run", stats.commands.toLocaleString(), true);
        embed.addField("Total Messages (This Shard & Session)", bot.stats.messagesTotal, true);
        embed.addField("Total Commands (This Shard & Session)", bot.stats.commandsTotal, true);
        embed.addField("Shard WS Ping", bot.client.ping+" ms", true);
        embed.addField("Shard Command Ping", (now-message.createdAt)+" ms", true);
        embed.addField("Voice Connections/Broadcasts", bot.client.voiceConnections.size+"/"+bot.client.broadcasts.size, true);

        console.log(now);
        console.log(message.createdAt);
        message.channel.send("", embed);





    }
};