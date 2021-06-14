const Discord = require('discord.js');
module.exports = {
    name: "View Custom Function",
    usage: "view <id>",
    commands: ["view", "get"],
    run: async function (message, args, bot, custom) {
        const func = await custom.getNameOrId(message, args, bot);
        if(!func)return;
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Function #${func.id}: ${func.trigger}`);
        embed.setDescription(`Use ID ${func.id} to edit/delete this.`);
        embed.addField("Type", func.type, true);
        embed.addField("Trigger", func.trigger, true);
        if(func.function.length < 900) {
            embed.addField("Code", `\`\`\`lua\n${func.function}\n\`\`\``);
            return message.channel.send({embeds: [embed]});
        } else {
            return message.channel.send({embeds: [embed], files: [new Discord.MessageAttachment(Buffer.from(func.function), "code.lua")]});
        }
    }
}