/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Command  Info",
    usage: "command <command ID>",
    commands: ["command", "commandinfo", "ci"],
    run: async function (message, args, bot) {
        const commandId = args[2];
        if(!commandId || isNaN(commandId))return message.channel.send(`Enter a command ID like: ${args[0]} ${args[1]} 42069`)
        message.channel.startTyping();
        let output = new Discord.MessageEmbed();
        const command = (await bot.database.getCommandById(commandId, process.env.CUSTOM_BOT ? bot.client.user.id : null))[0];
        if(!command)return message.channel.send(`Couldn't find a command by that ID.`);
        output.setTitle("Command #"+commandId);
        output.setAuthor(message.author.tag, message.author.avatarURL())
        output.setDescription("```\n"+command.command+"\n```");
        const [user, server, channel, product] = await Promise.all([
            bot.util.getInfo(bot, "users", command.userID),
            bot.util.getInfo(bot, "guilds", command.serverID),
            bot.util.getInfo(bot, "channels", command.channelID),
            bot.util.getInfo(bot, "users", command.productID),
        ]);
        output.addField("User", user ? `**${user.tag}** (${user.id})` :  command.userID, true);
        output.addField("Guild", server ? `**${server.name}** (${server.id})` : command.serverID, true);
        output.addField("Channel", channel ? `**#${channel.name}** (${channel.id})` :  command.channelID, true);
        output.addField("Bot",product ? `**${product.tag}** (${product.id})` :  command.productID, true);
        output.addField("Timestamp", command.timestamp.toLocaleString(), true);
        output.addField("Served By","`"+command.server+"`", true);
        message.channel.stopTyping(true);
        return message.channel.send({embeds: [output]});
    }
};