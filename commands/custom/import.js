module.exports = {
    name: "Import Function",
    usage: "import :id :trigger+",
    commands: ["import"],
    run: async function (context, bot) {
        const publishedFunction = await bot.database.getPublishedFunction(args[2]);
        if(!publishedFunction)return context.send({content: "Couldn't find that import ID. Check the ID is correct and try again.", ephemeral: true});
        let trigger = context.options.trigger;
        if(publishedFunction.type === "COMMAND"){
            if(trigger.indexOf(" ") > -1)return context.send({content: "This function is a command, which can't have multi-word triggers. Try again with a single word.", ephemeral: true});
            if(trigger.startsWith(context.getSetting("prefix")))return context.sendLang("CUSTOM_TRIGGER_PREFIX");
            if(bot.commands[trigger])return context.replyLang("CUSTOM_TRIGGER_BUILTIN");
            if(await bot.database.getCustomCommand(context.guild.id, trigger))return context.sendLang("CUSTOM_TRIGGER_EXISTS", {arg: context.command});
        }
        // It's the code duplication police!
        let schedule;
        if(publishedFunction.type === "SCHEDULED"){
            let parse = later.parse.text(trigger);
            if(parse.schedules.length === 0)
                return context.sendLang({content: "CUSTOM_SCHEDULE_ERROR", ephemeral: true});
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
                return context.sendLang({content: "CUSTOM_SCHEDULE_FREQUENCY", ephemeral: true});
            schedule = bot.util.parseSchedule(parse);

            // This is awful, we need to store the channel ID and the schedule, but we also need it to be deduplicated so store the message ID as a key
            trigger = context.channel.id+"/"+trigger+"/"+(context.message.id || context.interaction.id);
        }
        await bot.database.addCustomFunction(context.guild.id, "", trigger, publishedFunction.type, publishedFunction.code, context.user.id);
        if(bot.customFunctions[publishedFunction.type][context.guild.id])
            bot.customFunctions[publishedFunction.type][context.guild.id][trigger] = publishedFunction.code;
        else
            bot.customFunctions[publishedFunction.type][context.guild.id] = {[trigger]: publishedFunction.code}

        // This is really terrible
        if(publishedFunction.type === "SCHEDULED"){
            context.commandData.loadScheduled(bot);
        }

        await bot.database.incrementPublishedFunctionImports(publishedFunction.id);
        return context.sendLang(`CUSTOM_${publishedFunction.type}_SUCCESS`, {trigger, schedule});
    }
}