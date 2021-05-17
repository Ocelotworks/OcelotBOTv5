module.exports = {
    name: "Delete Custom Function",
    usage: "delete <id>",
    commands: ["delete", "del", "remove"],
    run: async function (message, args, bot, custom) {
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
            }else if(funcs.length === 1) {
                func = funcs[0];
            }
        }

        if(!func)return message.channel.send(`Couldn't find a function with that trigger or ID. Enter the trigger or find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);

        await bot.database.deleteCustomFunction(message.guild.id, func.id);

        if(bot.customFunctions[func.type][message.guild.id])
            delete bot.customFunctions[func.type][message.guild.id][func.trigger];

        if(func.type === "SCHEDULED")
            custom.loadScheduled(bot);

        return message.channel.send(`✅ Function was successfully deleted.\nHere is the code, in case you want to re-add it:\n\`\`\`lua\n${func.function}\n\`\`\``);
    }
}