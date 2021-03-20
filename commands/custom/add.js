module.exports = {
    name: "Add Custom Function",
    usage: "add command/autorespond <trigger> <code>",
    commands: ["add", "new", "create"],
    run: async function (message, args, bot) {
        if(!args[2])return message.channel.send("Invalid usage, you must specify a function type. Either 'command' or 'autorespond'.");
        let type = args[2].toUpperCase();
        if(["COMMAND", "AUTORESPOND"].includes(type)){
            if(!args[3])return message.channel.send("Invalid usage, you must specify a trigger word");
            let trigger = args[3].toLowerCase().split("\n")[0];
            if(type === "COMMAND" && trigger.startsWith(message.getSetting("prefix")))return message.channel.send("You do not need to include the prefix in your trigger.");
            if(type === "COMMAND" && bot.commands[trigger])return message.channel.send("You cannot override built-in commands with custom commands.");
            if(type === "COMMAND" && await bot.database.getCustomCommand(message.guild.id, trigger))return message.channel.send(`A custom command with that trigger already exists, to edit it use ${args[0]} edit`);

            let start = message.content.indexOf("```lua")
            let end = message.content.length - 4;
            if (start === -1) {
                start = args.slice(0, 4).join(" ").length+1;
                end = message.content.length;
            }else{
                if(type === "AUTORESPOND")
                    trigger = message.content.substring(message.content.indexOf(args[2])+args[2].length, start).trim();
                start += 6
            }
            let code = message.content.substring(start, end);
            console.log(code);
            let success = await bot.util.runCustomFunction(code, message, true, false);
            if(!success) return;

            await bot.database.addCustomFunction(message.guild.id, "", trigger, type, code, message.author.id);
            const responseType = type === "COMMAND" ? "customCommands" : "customAutoResponses";
            if(bot[responseType][message.guild.id])
                bot[responseType][message.guild.id][trigger] = code;
            else
                bot[responseType][message.guild.id] = {[trigger]: code}

            if(type === "COMMAND")
                return message.channel.send(`✅ Custom command added! **${message.getSetting("prefix")}${trigger}** will now trigger the function.`);
            return message.channel.send(`✅ Custom autorespond added! Messages containing **${trigger}** will now trigger the function.`);
        }else{
            return message.channel.send("Function type must be either 'command' or 'autorespond'.")
        }
    }
}