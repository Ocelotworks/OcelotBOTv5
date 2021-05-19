const later = require('later');
const Sentry = require('@sentry/node')
let cronIntervals = [];
module.exports = {
    name: "Custom Functions",
    usage: "custom add/list",
    rateLimit: 10,
    detailedHelp: "Add custom commands or autoresponders",
    categories: ["meta"],
    commands: ["custom", "customcommands"],
    init: async function init(bot) {
        bot.util.standardNestedCommandInit("custom");
        bot.customFunctions = {
            "COMMAND": {},
            "AUTORESPOND": {},
            "SCHEDULED": {},
        };
        bot.client.on("ready", ()=>{
            utils.loadScheduled(bot);
        })

    },
    run: function run(message, args, bot) {
        if(message.synthetic)return message.replyLang("GENERIC_CUSTOM_COMMAND");
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        if (!message.getBool("admin") && !message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You must have the Manage Server permission to use this command.");
        bot.util.standardNestedCommand(message, args, bot, "custom", utils);
    },
};


const utils = {
    async loadScheduled(bot){
        cronIntervals.forEach((c)=>c.clear());
        // I've got crons disease ha ha
        const crons = await bot.database.getCustomFunctionsForShard("SCHEDULED", bot.client.guilds.cache.keyArray());
        bot.logger.log(`Loading ${crons.length} cron functions`);
        for(let i = 0; i < crons.length; i++){
            try {
                const cron = crons[i];
                const triggerSplit = cron.trigger.split("/")
                const trigger = later.parse.text(triggerSplit[1]);
                const channel = await bot.client.channels.fetch(triggerSplit[0]);
                const interval = later.setInterval(async () => {
                    try {
                        Sentry.addBreadcrumb({
                            message: "Running custom cron",
                            data: cron,
                        })
                        if (!channel.lastMessageID) {
                            return bot.logger.warn(`No last message was sent in ${channel.id}`);
                        }
                        const message = (await channel.messages.fetch({limit: 1})).first();
                        bot.logger.log(`Running custom function #${cron.id}`);
                        const success = bot.util.runCustomFunction(cron.function, message, true, true);
                        if (!success) {
                            Sentry.captureMessage("Cron job failed to run");
                            bot.logger.warn(`Cron ${cron.id} failed to run`);
                            interval.clear();
                        }
                    }catch(e){
                        channel.send(`:warning: An internal error occurred running custom function ${cron.id}`);
                        bot.logger.log(e);
                        Sentry.captureException(e);
                    }
                }, trigger);
                cronIntervals.push(interval);
            }catch(e){
                bot.logger.error("Couldn't set up custom function");
                bot.logger.error(e);
            }
        }
    },
    isValidType(type){
        return ["COMMAND", "AUTORESPOND", "SCHEDULED"].includes(type)
    },
    getCodeBlock(message){
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
        return code;
    },
    async getNameOrId(message, args, bot){
        if(!args[2])
            return message.channel.send(`Enter a custom command to edit in the format **${args[0]} ${args[1]} name**`);

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
        return func;
    }
}