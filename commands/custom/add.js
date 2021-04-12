module.exports = {
    name: "Add Custom Function",
    usage: "add command/autorespond <trigger> <code>",
    commands: ["add", "new", "create"],
    run: async function (message, args, bot) {
        if(!args[2]) return message.replyLang("CUSTOM_USAGE");
        let type = args[2].toUpperCase();
        if(["COMMAND", "AUTORESPOND"].includes(type)){
            if(!args[3])return message.replyLang("CUSTOM_USAGE_TRIGGER_WORD");
            let trigger = args[3].toLowerCase().split("\n")[0];
            if(type === "COMMAND"){
                if(trigger.startsWith(message.getSetting("prefix")))return message.replyLang("CUSTOM_TRIGGER_PREFIX");
                if(bot.commands[trigger])return message.replyLang("CUSTOM_TRIGGER_BUILTIN");
                if(await bot.database.getCustomCommand(message.guild.id, trigger))return message.replyLang("CUSTOM_TRIGGER_EXISTS", {arg: args[0]});
            }
            let start = message.content.indexOf("```lua")
            let end = message.content.length - 4;
            if (start === -1) {
                start = args.slice(0, 4).join(" ").length+1;
                end = message.content.length;
            }else{
                if(type === "AUTORESPOND")
                    trigger = message.content.substring(message.content.indexOf(args[2])+args[2].length, start).trim().toLowerCase();
                start += 6
            }
            let code = message.content.substring(start, end);
            let success = await bot.util.runCustomFunction(code, message, true, false);
            if(!success) return;

            await bot.database.addCustomFunction(message.guild.id, "", trigger, type, code, message.author.id);
            const responseType = type === "COMMAND" ? "customCommands" : "customAutoResponses";
            if(bot[responseType][message.guild.id])
                bot[responseType][message.guild.id][trigger] = code;
            else
                bot[responseType][message.guild.id] = {[trigger]: code}

            return message.replyLang(`CUSTOM_${type}_SUCCESS`, {trigger});
        }else{
            return message.replyLang("CUSTOM_USAGE");
        }
    }
}