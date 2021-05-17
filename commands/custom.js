const later = require('later');
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
            module.exports.loadScheduled(bot);
        })

    },
    loadScheduled: async function loadScheduled(bot){
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
                    if(!channel.lastMessageID){
                        return bot.logger.warn(`No last message was sent in ${channel.id}`);
                    }
                    const message = await channel.messages.fetch(channel.lastMessageID);
                    bot.logger.log(`Running custom function #${cron.id}`);
                    const success = bot.util.runCustomFunction(cron.function, message, true, true);
                    if(!success){
                        bot.logger.warn(`Cron ${cron.id} failed to run`);
                        interval.clear();
                    }
                }, trigger);
                cronIntervals.push(interval);
            }catch(e){
                bot.logger.error("Couldn't set up custom function");
                bot.logger.error(e);
            }
        }
    },
    run: function run(message, args, bot) {
        if(message.synthetic)return message.replyLang("GENERIC_CUSTOM_COMMAND");
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        if (!message.getBool("admin") && !message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You must have the Manage Server permission to use this command.");
        bot.util.standardNestedCommand(message, args, bot, "custom", module.exports);
    },
};


