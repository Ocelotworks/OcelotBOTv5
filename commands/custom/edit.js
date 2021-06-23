module.exports = {
    name: "Edit Custom Function",
    usage: "edit :0id? :name :code+",
    commands: ["edit", "update"],
    run: async function (context, bot) {
        const func = await context.commandData.getNameOrId(context, bot);
        if(!func)return;
        const code = context.commandData.getCodeBlock(context);

        if(code.length === 0)
            return context.send({content: ":warning: Couldn't figure out where your code starts. For the best results, enter your code inside of a codeblock (wrapped in ```)", ephemeral: true})

        // TODO
        let success = await bot.util.runCustomFunction(code, context.message, true, false);
        if(!success)return;

        await bot.database.updateCustomFunction(context.guild.id, func.id, code);

        if(bot.customFunctions[func.type][context.guild.id])
            bot.customFunctions[func.type][context.guild.id][func.trigger] = code;
        else
            bot.customFunctions[func.type][context.guild.id] = {[func.trigger]: code}

        // This is really terrible
        if(func.type === "SCHEDULED"){
            context.commandData.loadScheduled(bot);
        }

        return context.send("✅ Function was successfully edited!");
    }
}