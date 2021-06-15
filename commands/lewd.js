const config = require('config');
module.exports = {
    name: "Random Lewd Image",
    usage: "lewd",
    usageExample: "lewd",
    commands: ["lewd"],
    categories: ["nsfw"],
    slashOptions: [],
    run: async function(message, args, bot){
        const data = await bot.util.getJson("https://gallery.fluxpoint.dev/api/nsfw/lewd", null, {
            "Authorization": config.get("API.fluxpoint.key"),
        });
        return message.channel.send(data.file)
    },
    runSlash: async function(interaction, bot){
        const data = await bot.util.getJson("https://gallery.fluxpoint.dev/api/nsfw/lewd", null, {
            "Authorization": config.get("API.fluxpoint.key"),
        });
        return interaction.reply(data.file)
    }
};