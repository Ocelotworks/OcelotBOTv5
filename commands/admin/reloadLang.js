module.exports = {
    name: "Reload Languages",
    usage: "reloadlang",
    commands: ["reloadlang"],
    slashHidden: true,
    init: async function (bot) {
        bot.bus.on("reloadLang", async () => {
            bot.logger.log("Reloading languages...");
            await bot.lang.loadLanguages();
        })
    },
    run: async function (context, bot) {
        await bot.rabbit.event({type: "reloadLang"});
        return context.send(`Loaded ${Object.keys(bot.lang.strings['en-gb']).length} unique keys.`);
    }
};