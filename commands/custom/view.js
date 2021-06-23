const Discord = require('discord.js');
module.exports = {
    name: "View Custom Function",
    usage: "view :0id? :name?+",
    commands: ["view", "get"],
    run: async function (context, bot) {
        const func = await context.commandData.getNameOrId(context, bot);
        if(!func)return;
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Function #${func.id}: ${func.trigger}`);
        embed.setDescription(`Use ID ${func.id} to edit/delete this.`);
        embed.addField("Type", func.type, true);
        embed.addField("Trigger", func.trigger, true);
        if(func.function.length < 900) {
            embed.addField("Code", `\`\`\`lua\n${func.function}\n\`\`\``);
            return context.send({embeds: [embed]});
        } else {
            // TODO: this won't work as an interaction
            return context.send({embeds: [embed], files: [new Discord.MessageAttachment(Buffer.from(func.function), "code.lua")]});
        }
    }
}