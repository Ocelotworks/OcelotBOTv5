const later = require('later');
module.exports = {
    name: "Add Custom Function",
    usage: "add command/autorespond/scheduled <trigger> <code>",
    commands: ["add", "new", "create"],
    run: async function (message, args, bot, custom) {
        if(!message.getBool("serverPremium")){
            const funcs = await bot.database.getCustomFunctions(message.guild.id);
            if(funcs.length >= 2)
                return message.channel.send(`:warning: Adding more than 2 custom functions requires **OcelotBOT Premium**! Learn more with ${message.getSetting("prefix")}premium`);
        }
        if(!args[2]) return message.replyLang("CUSTOM_USAGE");
        let type = args[2].toUpperCase();
        if(["COMMAND", "AUTORESPOND", "SCHEDULED"].includes(type)){
            if(!args[3])return message.replyLang("CUSTOM_USAGE_TRIGGER_WORD");
            let trigger = args[3].toLowerCase().split("\n")[0];
            if(type === "COMMAND"){
                if(trigger.startsWith(message.getSetting("prefix")))return message.replyLang("CUSTOM_TRIGGER_PREFIX");
                if(bot.commands[trigger])return message.replyLang("CUSTOM_TRIGGER_BUILTIN");
                if(await bot.database.getCustomCommand(message.guild.id, trigger))return message.replyLang("CUSTOM_TRIGGER_EXISTS", {arg: args[0]});
            }
            let start = message.content.indexOf("```")
            let end = message.content.length - 4;
            if (start === -1) {
                start = args.slice(0, 4).join(" ").length+1;
                end = message.content.length;
            }else{
                if(type !== "COMMAND")
                    trigger = message.content.substring(message.content.indexOf(args[2])+args[2].length, start).trim().toLowerCase();
                start += 3
            }

            // oh man
            let schedule;
            if(type === "SCHEDULED"){
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

            let code = message.content.substring(start, end).trim();

            if(code.startsWith("lua"))code = code.substring(3); // Remove lua from the start of the codeblock

            if(code.length === 0){
                return message.channel.send(":warning: Couldn't figure out where your code starts. For the best results, enter your code inside of a codeblock (wrapped in ```)")
            }

            let success = await bot.util.runCustomFunction(code, message, true, false);
            if(!success) return;

            await bot.database.addCustomFunction(message.guild.id, "", trigger, type, code, message.author.id);
            if(bot.customFunctions[type][message.guild.id])
                bot.customFunctions[type][message.guild.id][trigger] = code;
            else
                bot.customFunctions[type][message.guild.id] = {[trigger]: code}


            // This is really terrible
            if(type === "SCHEDULED"){
                custom.loadScheduled(bot);
            }

            return message.replyLang(`CUSTOM_${type}_SUCCESS`, {trigger, schedule});
        }else{
            return message.replyLang("CUSTOM_USAGE");
        }
    }
}