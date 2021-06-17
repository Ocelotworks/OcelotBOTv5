const axios = require('axios');
module.exports = {
    name: "Inspriational Quote",
    usage: "inspiration",
    rateLimit: 10,
    detailedHelp: "Generates a random inspirational quote",
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["inspiration", "inspirational", "inspirationalquote", "inspo"],
    unwholesome: true,
    run: async function(context){
        return context.reply((await axios.get("https://inspirobot.me/api?generate=true")).data);
    },
};