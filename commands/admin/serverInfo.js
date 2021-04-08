/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
const columnify = require('columnify');
module.exports = {
    name: "Server Info",
    usage: "server <server ID>",
    commands: ["server", "serverinfo", "si", "guild", "guildinfo", "gi"],
    run: async function (message, args, bot) {
        const serverId = args[2];
        if(!serverId)return message.channel.send(`Enter a user ID like: ${args[0]} ${args[1]} 322032568558026753`)
        message.channel.startTyping();
        let guild = await bot.util.getInfo(bot, "guilds", serverId);
        let output = new Discord.MessageEmbed();

        output.setAuthor(message.author.tag, message.author.avatarURL())

        if(guild){
            output.setTitle(`Info for ${guild.name} (${serverId})`);
            output.setThumbnail(guild.iconURL())
        }else{
            output.setTitle(`Info for ${serverId}`);
        }

        if(bot.banCache.server.includes(serverId)){
            const banInfo = await bot.database.getBan(serverId);
            output.addField("⚠ Guild Banned", `${banInfo[0].reason}`);
        }

        if(bot.config.cache[serverId]){
            output.addField("Settings Applied", `\`\`\`\n${Object.keys(bot.config.cache[serverId]).map((key)=>`${key}: ${bot.config.cache[serverId][key]}`).join("\n")}\n\`\`\``);
        }

        const [joinedServer, leftServer] = await Promise.all([
            bot.database.getServer(serverId),
            bot.database.getLeftServer(serverId),
        ]);

        if(joinedServer[0]){
            const owner = await bot.util.getUserInfo(joinedServer[0].owner);
            output.addField("Owner", owner ? `${owner.tag} (${owner.id})`: joinedServer[0].owner);
            output.addField("First Joined", joinedServer[0].timestamp.toLocaleString(), true);
        }else{
            output.addField("‼ Error", "Server is not in servers table!", );
        }

        if(leftServer[0]){
            output.addField("ℹ Left On", leftServer.map((l)=>l.timestamp.toLocaleString()).join("\n"), true);
        }


        let lastCommands = await bot.database.getServerCommands(serverId);
        output.addField("Last 5 Commands", `Use **${args[0]} ci <id>** for more info\n\`\`\`\n${columnify(lastCommands)}\n\`\`\``)
        message.channel.stopTyping(true);
        return message.channel.send(output);
    }
};