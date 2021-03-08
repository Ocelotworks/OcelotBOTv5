module.exports = {
    name: "Edit Custom Function",
    usage: "edit <id> <code>",
    commands: ["edit", "update"],
    run: async function (message, args, bot) {
        if(!args[2] || isNaN(args[2].split("\n")[0]))return message.channel.send(`Invalid ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`)
        let func = (await bot.database.getCustomFunction(message.guild.id, parseInt(args[2])))[0];
        if(!func)return message.channel.send(`Couldn't find a function with that ID. Find the ID with **${args[0]} list**. Then enter **${args[0]} ${args[1]} id**`);
        let start = message.content.indexOf("```lua")
        let end = message.content.length - 4;
        if (start === -1) {
            start = args.slice(0, 3).join(" ").length+1;
            end = message.content.length;
        }else{
            start += 6
        }
        let code = message.content.substring(start, end);

        let {output, success} = await bot.util.runCustomFunction(code, message);
        if(!success)
            return message.channel.send(output);

        await bot.database.updateCustomFunction(message.guild.id, parseInt(args[2]), code);
        bot.redis.clear(`custom/${message.guild.id}/${func.type}/${func.trigger}`);
        return message.channel.send("✅ Function was successfully edited!");
    }
}