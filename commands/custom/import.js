module.exports = {
    name: "Import Function",
    usage: "import <id> <trigger>",
    commands: ["import"],
    run: async function (message, args, bot, custom) {
        if(!args[2])return message.channel.send("You need to enter an import ID to use this command.");
        if(!args[3])return message.channel.send("You need to enter a trigger for your function. Depending on the type of your import this could be a function name, trigger word or schedule.");
        const publishedFunction = await bot.database.getPublishedFunction(args[2]);
        if(!publishedFunction)return message.channel.send("Couldn't find that import ID. Check the ID is correct and try again.");
        let trigger = args.slice(3).join(" ");
        if(publishedFunction.type === "COMMAND"){
            if(trigger.indexOf(" ") > -1)return message.channel.send("This function is a command, which can't have multi-word triggers. Try again with a single word.");
            if(trigger.startsWith(message.getSetting("prefix")))return message.replyLang("CUSTOM_TRIGGER_PREFIX");
            if(bot.commands[trigger])return message.replyLang("CUSTOM_TRIGGER_BUILTIN");
            if(await bot.database.getCustomCommand(message.guild.id, trigger))return message.replyLang("CUSTOM_TRIGGER_EXISTS", {arg: args[0]});
        }
        // It's the code duplication police!
        let schedule;
        if(publishedFunction.type === "SCHEDULED"){
            let parse = later.parse.text(trigger);
            if(parse.schedules.length === 0)
                return message.channel.send("Unable to parse time. Try 'every 5 minutes' or 'every 1 day at 9:55pm'");
            let occurrences = later.schedule(parse).next(10);
            let tooShort = 0;

            if (occurrences.length > 1) {
                for (let i = 0; i < occurrences.length - 1; i++) {
                    let first = occurrences[i];
                    let second = occurrences[i + 1];

                    if (!second || second - first < 10000) {
                        tooShort++;
                    }
                }
            }

            if (tooShort > occurrences.length / 2)
                return message.channel.send(":warning: Your schedule is too frequent. You must have at least 10 seconds between runs.");
            schedule = bot.util.parseSchedule(parse);

            // This is awful, we need to store the channel ID and the schedule, but we also need it to be deduplicated so store the message ID as a key
            trigger = message.channel.id+"/"+trigger+"/"+message.id;
        }
        await bot.database.addCustomFunction(message.guild.id, "", trigger, publishedFunction.type, publishedFunction.code, message.author.id);
        if(bot.customFunctions[publishedFunction.type][message.guild.id])
            bot.customFunctions[publishedFunction.type][message.guild.id][trigger] = publishedFunction.code;
        else
            bot.customFunctions[publishedFunction.type][message.guild.id] = {[trigger]: publishedFunction.code}

        // This is really terrible
        if(publishedFunction.type === "SCHEDULED"){
            custom.loadScheduled(bot);
        }

        await bot.database.incrementPublishedFunctionImports(publishedFunction.id);
        return message.replyLang(`CUSTOM_${publishedFunction.type}_SUCCESS`, {trigger, schedule});
    }
}