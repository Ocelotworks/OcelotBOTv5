const later = require('later');
module.exports = {
    name: "Add Custom Function",
    usage: "add [type:command,autorespond,scheduled] :trigger :triggerAndCode+",
    commands: ["add", "new", "create"],
    run: async function (context, bot) {
        if(!context.getBool("serverPremium")){
            const funcs = await bot.database.getCustomFunctions(context.guild.id);
            if(funcs.length >= 2)
                return context.sendLang({content: "CUSTOM_LIMIT", ephemeral: true});
        }
        let type = context.options.type.toUpperCase();
        let trigger = context.options.trigger.toLowerCase();
        if(type === "COMMAND"){
            if(trigger.startsWith(context.getSetting("prefix")))return context.sendLang({content: "CUSTOM_TRIGGER_PREFIX", ephemeral: true});
            if(bot.commands[trigger])return context.sendLang({content: "CUSTOM_TRIGGER_BUILTIN", ephemeral: true});
        }
        if(type === "COMMAND" || type === "AUTORESPOND" && await bot.database.getCustomCommand(context.guild.id, trigger))
            return context.sendLang({content: "CUSTOM_TRIGGER_EXISTS", ephemeral: true}, {arg: context.command});
        let start = context.options.triggerAndCode.indexOf("```")
        let end = context.options.triggerAndCode.length - 4;
        if (start === -1) {
            start = trigger.length+1;
            end = context.options.triggerAndCode.length;
        }else{
            if(type !== "COMMAND")
                trigger = context.options.trigger+" "+context.options.triggerAndCode.substring(0, start);
            start += 3
        }

        // oh man
        let schedule;
        if(type === "SCHEDULED"){
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
                return context.send({content: "CUSTOM_SCHEDULE_FREQUENCY", ephemeral: true});
            schedule = bot.util.parseSchedule(parse);

            // This is awful, we need to store the channel ID and the schedule, but we also need it to be deduplicated so store the message ID as a key
            trigger = context.channel.id+"/"+trigger+"/"+(context.command?.id || context.interaction?.id);
        }

        let code = context.options.triggerAndCode.substring(start, end).trim();

        if(code.startsWith("lua"))code = code.substring(3); // Remove lua from the start of the codeblock

        if(code.length === 0){
            return context.sendLang({content: "CUSTOM_CODE_AMBIGUOUS", ephemeral: true})
        }

        // TODO: Custom functions
        let success = await bot.util.runCustomFunction(code, context.message, true, false);
        if(!success) return;

        await bot.database.addCustomFunction(context.guild.id, "", trigger, type, code, context.user.id);
        if(bot.customFunctions[type][context.guild.id])
            bot.customFunctions[type][context.guild.id][trigger] = code;
        else
            bot.customFunctions[type][context.guild.id] = {[trigger]: code}


        // This is really terrible
        if(type === "SCHEDULED"){
            context.commandData.loadScheduled(bot);
        }

        return context.replyLang(`CUSTOM_${type}_SUCCESS`, {trigger, schedule});
    }
}