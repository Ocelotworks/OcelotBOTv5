const config = require('config');
const {axios} = require("../util/Http");
module.exports = {
    name: "Random Lewd Image",
    usage: "lewd",
    usageExample: "lewd",
    commands: ["lewd"],
    categories: ["nsfw"],
    slashOptions: [],
    run: async function(context, bot){
        const {data} = await axios.get("https://gallery.fluxpoint.dev/api/nsfw/img/lewd", {
            headers: {
                "Authorization": config.get("API.fluxpoint.key"),
            }
        })
        return context.send(data.file)
    },
};