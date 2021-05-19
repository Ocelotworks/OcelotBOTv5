module.exports = {
    name: "Edit Custom Function",
    usage: "edit <id> <code>",
    commands: ["edit", "update"],
    run: async function (message, args, bot, custom) {
        const func = await custom.getNameOrId(message, args, bot);
        if(!func)return;
        const code = custom.getCodeBlock(message);

        if(code.length === 0){
            return message.channel.send(":warning: Couldn't figure out where your code starts. For the best results, enter your code inside of a codeblock (wrapped in ```)")
        }

        let success = await bot.util.runCustomFunction(code, message, true, false);
        if(!success)return;

        await bot.database.updateCustomFunction(message.guild.id, func.id, code);

        if(bot.customFunctions[func.type][message.guild.id])
            bot.customFunctions[func.type][message.guild.id][func.trigger] = code;
        else
            bot.customFunctions[func.type][message.guild.id] = {[func.trigger]: code}

        // This is really terrible
        if(func.type === "SCHEDULED"){
            custom.loadScheduled(bot);
        }

        return message.channel.send("✅ Function was successfully edited!");
    }
}