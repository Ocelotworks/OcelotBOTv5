const Discord = require('discord.js');
const axios = require('axios');
module.exports = {
    name: "Inspriational Quote",
    usage: "inspiration",
    rateLimit: 10,
    detailedHelp: "Generates a random inspirational quote",
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["inspiration", "inspirational", "inspirationalquote"],
    unwholesome: true,
    run: async function(message, args, bot){
        let result = await axios.get("https://inspirobot.me/api?generate=true");

        return message.channel.send(new Discord.MessageAttachment(result.data))

    }
};