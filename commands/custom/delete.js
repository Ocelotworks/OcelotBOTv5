module.exports = {
    name: "Delete Custom Function",
    usage: "delete <id>",
    commands: ["delete", "del", "remove"],
    run: async function (message, args, bot) {
        if(!args[2] || isNaN(args[2]))return message.channel.send(`Invalid ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`)
        let func = (await bot.database.getCustomFunction(message.guild.id, parseInt(args[2])))[0];
        if(!func)return message.channel.send(`Couldn't find a function with that ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);

        await bot.database.deleteCustomFunction(message.guild.id, parseInt(args[2]));
        bot.redis.clear(`custom/${message.guild.id}/${func.type}/${func.trigger}`);
        return message.channel.send(`✅ Function was successfully deleted.\nHere is the code, in case you want to re-add it:\n\`\`\`lua\n${func.function}\n\`\`\``);
    }
}