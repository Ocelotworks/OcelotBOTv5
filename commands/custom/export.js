module.exports = {
    name: "Publish Function",
    usage: "publish <id>",
    commands: ["publish", "export", "share"],
    run: async function (message, args, bot, custom) {
        const func = await custom.getNameOrId(message, args, bot);
        if(!func)return;
        let publishedFunction = await bot.database.getPublishedFunctionFromOrigin(func.id);
        if(publishedFunction){
            await bot.database.updatePublishedFunction(publishedFunction.id, func.function);
            return message.channel.send(`:white_check_mark: Re-published your function successfully.\n:information_source: Anyone who has imported the function already will not receive the updated version.\nYour import code is: **${publishedFunction.id}**`);
        }
        const code = bot.util.getUniqueId(message);
        await bot.database.createPublishedFunction(code, func.trigger, func.type, func.function, message.author.id, func.id);
        return message.channel.send(`:white_check_mark: Your function has been published!\nImport into other servers with **${args[0]} import ${code}**`);
    }
}