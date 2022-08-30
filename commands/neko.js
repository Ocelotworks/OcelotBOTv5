const config = require('config');
const {axios} = require('../util/Http')
module.exports = {
    name: "Random Neko Image",
    usage: "neko",
    usageExample: "neko",
    commands: ["neko", "nekopara"],
    categories: ["nsfw"],
    slashOptions: [],
    run: async function(context, bot){
        const {data} = await axios.get("https://gallery.fluxpoint.dev/api/nsfw/img/neko", {
            headers: {
                "Authorization": config.get("API.fluxpoint.key"),
            }
        })
        return context.send(data.file)
    },
};