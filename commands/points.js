const Discord = require('discord.js');
module.exports = {
    name: "Points",
    usage: "points",
    categories: ["meta"],
    detailedHelp: "View the amount of points you have",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["points"],
    run: async function(message, args, bot){
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Your Balance");
        embed.setAuthor(message.author.username, message.author.avatarURL());
        embed.setDescription(`<:points:817100139603820614>**${(await bot.database.getPoints(message.author.id)).toLocaleString()}**.`);
        embed.addField("What are points?", "Points can be used to access certain commands and to unlock profile features.\n[Learn More](https://ocelotbot.xyz/)");
        embed.addField("How can I get points?", "You can get points by **voting**, **referring servers** or by **winning games**.\n[Learn More](https://ocelotbot.xyz/)");
        embed.setColor("#03F783");
        return message.channel.send(embed);
    }
};