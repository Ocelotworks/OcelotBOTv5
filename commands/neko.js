const config = require('config');
module.exports = {
    name: "Random Neko Image",
    usage: "neko",
    usageExample: "neko",
    commands: ["neko", "nekopara"],
    categories: ["nsfw"],
    slashOptions: [],
    slashHidden: true,
    run: async function(context, bot){
        const data = await bot.util.getJson("https://gallery.fluxpoint.dev/api/nsfw/nekopara", null, {
            "Authorization": config.get("API.fluxpoint.key"),
        });
        return context.send(data.file)
    },
};