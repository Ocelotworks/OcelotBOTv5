const Discord = require('discord.js');
module.exports = {
    name: "View Custom Function",
    usage: "view <id>",
    commands: ["view", "get"],
    run: async function (message, args, bot) {
        if(!args[2]) {
            return message.channel.send(`Enter a custom command to edit in the format **${args[0]} ${args[1]} name**`);
        }

        let func;

        if(!isNaN(args[2])){
            func = (await bot.database.getCustomFunction(message.guild.id, parseInt(args[2])))[0];
        }

        if(!func){
            const funcs = await bot.database.getCustomFunctionByTrigger(message.guild.id, args[2]);
            if(funcs.length > 1){
                return message.channel.send(`:thinking: There are multiple functions with that name. Instead, enter the ID from **${args[0]} list** in the format **${args[0]} ${args[1]} id**`)
            }
            func = funcs[0];
        }

        if(!func)return message.channel.send(`Couldn't find a function with that trigger or ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);
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