module.exports = {
    name: "Edit Custom Function",
    usage: "edit <id> <code>",
    commands: ["edit", "update"],
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
            }
            func = funcs[0];
        }

        if(!func)return message.channel.send(`Couldn't find a function with that trigger or ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);
        let start = message.content.indexOf("```")
        let end = message.content.length - 4;
        if (start === -1) {
            start = args.slice(0, 3).join(" ").length+1;
            end = message.content.length;
        }else{
            start += 3
        }
        let code = message.content.substring(start, end);

        if(code.startsWith("lua"))code = code.substring(3); // Remove lua from the start of the codeblock

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