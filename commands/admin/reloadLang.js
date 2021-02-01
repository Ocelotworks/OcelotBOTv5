module.exports = {
    name: "Reload Languages",
    usage: "reloadlang",
    commands: ["reloadlang"],
    init: async function(bot){
        bot.bus.on("reloadLang", async ()=>{
            bot.logger.log("Reloading languages...");
            await bot.lang.loadLanguages();
        })
    },
    run:  async function(message, args, bot){
        await bot.rabbit.event({type: "reloadLang"});
        message.channel.send(`Loaded ${bot.lang.strings['en-gb'].length} unique keys and ${Object.keys(bot.lang.strings).length} languages.`);
    }
};