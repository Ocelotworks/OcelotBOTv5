const Discord = require('discord.js');
module.exports = {
    name: "View Custom Function",
    usage: "view <id>",
    commands: ["view", "get"],
    run: async function (message, args, bot) {
        if(!args[2] || isNaN(args[2]))return message.channel.send(`Invalid ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`)
        let func = (await bot.database.getCustomFunction(message.guild.id, args[2]))[0];
        if(!func)return message.channel.send(`Couldn't find a function with that ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);
        const embed = new Discord.MessageEmbed();
        embed.setTitle(`Function #${func.id}: ${func.trigger}`);
        embed.setDescription(`Use ID ${func.id} to edit/delete this.`);
        embed.addField("Type", func.type, true);
        embed.addField("Trigger", func.trigger, true);
        console.log(func.function.length)
        if(func.function.length < 900) {
            embed.addField("Code", `\`\`\`lua\n${func.function}\n\`\`\``);
            return message.channel.send(embed);
        } else {
            await message.channel.send(embed);
            return message.channel.send(new Discord.MessageAttachment(Buffer.from(func.function), "code.lua"))
        }
    }
}