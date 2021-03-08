const Discord = require('discord.js');
module.exports = {
    name: "Custom Function Documentation",
    usage: "docs",
    commands: ["docs", "documentation"],
    run: async function (message, args, bot) {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Custom Functions`);
        embed.setDescription(`Custom Functions are written in [Lua](http://www.lua.org/docs.html) and must return a string, which will be sent as a message.`);
        embed.addField("Taking Input", `Information about the message is available to you. The structure is as follows:\n\`\`\`json\n${JSON.stringify(bot.util.serialiseMessage(message), null, 1)}\n\`\`\`\nYou can access it in lua through \`message\`.`);
        embed.addField("Example", `A simple example which mentions the user who did the command:\n\`\`\`lua\nreturn "Hello, <@"..message.author.id..">"\n\`\`\``)
        return message.channel.send(embed);
    }
}