module.exports = {
    name: "Publish Function",
    usage: "publish :0id? :name?+",
    commands: ["publish", "export", "share"],
    run: async function (context, bot) {
        const func = await context.commandData.getNameOrId(context, bot);
        if(!func)return;
        let publishedFunction = await bot.database.getPublishedFunctionFromOrigin(func.id);
        if(publishedFunction){
            await bot.database.updatePublishedFunction(publishedFunction.id, func.function);
            return context.send(`:white_check_mark: Re-published your function successfully.\n:information_source: Anyone who has imported the function already will not receive the updated version.\nYour import code is: **${publishedFunction.id}**`);
        }
        const code = bot.util.getUniqueId(context.message || context.interaction);
        await bot.database.createPublishedFunction(code, func.trigger, func.type, func.function, context.user.id, func.id);
        return context.send(`:white_check_mark: Your function has been published!\nImport into other servers with **${context.command} import ${code}**`);
    }
}