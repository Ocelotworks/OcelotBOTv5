/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
const columnify = require('columnify');
module.exports = {
    name: "User Info",
    usage: "user <user ID>",
    commands: ["user", "userinfo", "ui"],
    run: async function (message, args, bot) {
        const userId = args[2];
        if(!userId || userId.startsWith("<"))return message.channel.send(`Enter a user ID like: ${args[0]} ${args[1]} 139871249567318017`)
        message.channel.startTyping();
        let user = await bot.util.getUserInfo(userId);
        let output = new Discord.MessageEmbed();

        output.setAuthor(message.author.tag, message.author.avatarURL())

        if(user){
            output.setTitle(`Info for ${user.tag} (${userId})`);
            output.setImage(user.avatarURL())
        }else{
            output.setTitle(`Info for ${userId}`);
        }

        if(bot.banCache.user.includes(userId)){
            const banInfo = await bot.database.getBan(userId);
            output.addField("⚠ User Banned", trim(banInfo[0].reason || "Not specified"));
        }

        if(bot.config.cache[userId]){
            output.addField("Settings Applied", trim(`\`\`\`\n${Object.keys(bot.config.cache[userId]).map((key)=>`${key}: ${bot.config.cache[userId][key]}`).join("\n")}\n\`\`\``));
        }

        let guildCollection = (await bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.members.cache.has('${userId}')).map((guild)=>\`\${guild.name} (\${guild.id})\`);
        `)).reduce((a,b)=>a.concat(b), []);
        output.addField("Seen in", guildCollection.length === 0 ? guildCollection.join(", ") : "Nowhere.");


        let lastCommands = await bot.database.getUserCommands(userId, process.env.CUSTOM_BOT ? bot.client.user.id : null);
        output.addField("Last 5 Commands", trim(`Use **${args[0]} ci <id>** for more info\n\`\`\`\n${columnify(lastCommands)}\n\`\`\``))
        message.channel.stopTyping(true);
        return message.channel.send(output);
    }
};

function trim(input){
    return input.substring(0,1024);
}