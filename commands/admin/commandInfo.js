/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Command  Info",
    usage: "command :0commandID",
    commands: ["command", "commandinfo", "ci"],
    run: async function (context, bot) {
        const commandId = context.options.commandID;
        await context.defer();
        let output = new Discord.MessageEmbed();
        const command = (await bot.database.getCommandById(commandId, process.env.CUSTOM_BOT ? bot.client.user.id : null))[0];
        if(!command)return context.send({content: `Couldn't find a command by that ID.`, ephemeral: true});
        output.setTitle("Command #"+commandId);
        output.setAuthor(context.user.tag, context.user.avatarURL())
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
        output.addField("Timestamp", `<t:${Math.floor(command.timestamp.getTime()/1000)}> (${command.timestamp.getTime()})`, true);
        output.addField("Message ID", command.messageID, true);
        output.addField("Type",command.type, true);
        output.addField("Served By","`"+command.server+"`", true);
        const buttons = [];
        if(user) buttons.push(bot.interactions.suggestedCommand(context, `ui ${user.id}`));
        if(server) buttons.push(bot.interactions.suggestedCommand(context, `si ${server.id}`));
        buttons.push(bot.interactions.suggestedCommand(context, `cd ${command.commandID}`));
        if(command.type === "message")
            buttons.push(bot.interactions.fullSuggestedCommand(context, `${command.command.substring(command.command.indexOf(command.commandID)+1)}`));
        return context.send({
            embeds: [output],
            components: [bot.util.actionRow(...buttons)]
        });
    }
};