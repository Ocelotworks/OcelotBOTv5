module.exports = {
    name: "Delete Custom Function",
    usage: "delete :0id? :name?",
    commands: ["delete", "del", "remove"],
    run: async function (context, bot) {
        const func = await context.commandData.getNameOrId(context, bot);
        if(!func)return;
        await bot.database.deleteCustomFunction(context.guild.id, func.id);

        if(bot.customFunctions[func.type] && bot.customFunctions[func.type][context.guild.id])
            delete bot.customFunctions[func.type][context.guild.id][func.trigger];

        if(func.type === "SCHEDULED")
            context.commandData.loadScheduled(bot);

        return context.send(`✅ Function was successfully deleted.\nHere is the code, in case you want to re-add it:\n\`\`\`lua\n${func.function}\n\`\`\``);
    }
}