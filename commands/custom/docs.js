const Discord = require('discord.js');
module.exports = {
    name: "Custom Function Documentation",
    usage: "docs",
    commands: ["docs", "documentation"],
    run: async function (context) {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Custom Functions`);
        embed.setDescription(`Custom Functions are written in [Lua](http://www.lua.org/docs.html) and can optionally return a string, which will be sent as a message.`);
        embed.addField("Documentation", `You can view advanced documentation [here](https://docs.ocelotbot.xyz/custom-commands)`);
        embed.addField("Example", `A simple example which mentions the user who did the command:\n\`\`\`lua\nreturn "Hello, <@"..message.author.id..">"\n\`\`\``)
        return context.send({embeds: [embed]});
    }
}