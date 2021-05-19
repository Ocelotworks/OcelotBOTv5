module.exports = {
    name: "Delete Custom Function",
    usage: "delete <id>",
    commands: ["delete", "del", "remove"],
    run: async function (message, args, bot, custom) {
        const func = await custom.getNameOrId(message, args, bot);
        if(!func)return;
        await bot.database.deleteCustomFunction(message.guild.id, func.id);

        if(bot.customFunctions[func.type][message.guild.id])
            delete bot.customFunctions[func.type][message.guild.id][func.trigger];

        if(func.type === "SCHEDULED")
            custom.loadScheduled(bot);

        return message.channel.send(`✅ Function was successfully deleted.\nHere is the code, in case you want to re-add it:\n\`\`\`lua\n${func.function}\n\`\`\``);
    }
}