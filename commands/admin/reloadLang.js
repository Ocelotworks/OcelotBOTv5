module.exports = {
    name: "Reload Languages",
    usage: "reloadlang",
    commands: ["reloadlang"],
    run:  async function(message, args, bot){
        await bot.lang.loadLanguages();
        message.channel.send(`Loaded ${bot.lang.strings.default.length} unique keys and ${Object.keys(bot.lang.strings).length} languages.`);
    }
};