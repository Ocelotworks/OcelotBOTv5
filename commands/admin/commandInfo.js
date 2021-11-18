/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Command  Info",
    usage: "command :commandID",
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
            bot.util.getInfo(bot, "users", command.userid),
            bot.util.getInfo(bot, "guilds", command.serverid),
            bot.util.getInfo(bot, "channels", command.channelid),
            bot.util.getInfo(bot, "users", command.productid),
        ]);
        output.addField("User", user ? `**${user.tag}** (${user.id})` :  command.userid, true);
        output.addField("Guild", server ? `**${server.name}** (${server.id})` : command.serverid, true);
        output.addField("Channel", channel ? `**#${channel.name}** (${channel.id})` :  command.channelid, true);
        output.addField("Bot",product ? `**${product.tag}** (${product.id})` :  command.product, true);
        output.addField("Timestamp", `<t:${Math.floor(command.timestamp.getTime()/1000)}> (${command.timestamp.getTime()})`, true);
        output.addField("Message ID", command.messageid, true);
        output.addField("Type",command.type, true);
        output.addField("Served By","`"+command.handler+"`", true);
        const buttons = [];
        if(user) buttons.push(bot.interactions.suggestedCommand(context, `ui ${user.id}`));
        if(server) buttons.push(bot.interactions.suggestedCommand(context, `si ${server.id}`));
        buttons.push(bot.interactions.suggestedCommand(context, `cd ${command.commandid}`));
        if(command.type === "message")
            buttons.push(bot.interactions.fullSuggestedCommand(context, `${command.command.substring(command.command.indexOf(command.commandid))}`));
        return context.send({
            embeds: [output],
            components: [bot.util.actionRow(...buttons)]
        });
    }
};