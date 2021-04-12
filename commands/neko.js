const config = require('config');
module.exports = {
    name: "Random Neko Image",
    usage: "neko",
    usageExample: "neko",
    commands: ["neko", "nekopara"],
    categories: ["nsfw"],
    run: async function(message, args, bot){
        const data = await bot.util.getJson("https://gallery.fluxpoint.dev/api/nsfw/nekopara", null, {
            "Authorization": config.get("API.fluxpoint.key"),
        });
        return message.channel.send(data.file)
    }
};