const Discord = require('discord.js');
module.exports = {
    name: "View Balance",
    usage: "balance [@user]",
    commands: ["balance", "bal"],
    run: async function (message, args, bot) {
        let target = message.author;
        if (message.mentions.users.first())
            target = message.mentions.users.first()
        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Current Balance`);
        embed.setAuthor(target.username, target.avatarURL());
        embed.setDescription(`<:points:817100139603820614>**${(await bot.database.getPoints(target.id)).toLocaleString()}**.`);
        if (message.getBool("points.enabled")) {
            embed.addField("What are points?", "Points can be used to access certain commands and to unlock profile features.\n[Learn More](https://ocelotbot.xyz/guides/what-are-points?-discord)");
            embed.addField("How can I get points?", "You can get points by **voting**, **referring servers** or by **winning games**.\n[Learn More](https://ocelotbot.xyz/guides/how-to-get-points-discord/)");
        } else {
            embed.addField("What are points?", "Points are a work-in-progress feature that is currently being tested across OcelotBOT. This server is currently not part of the test, but you can still gain points here.")
        }
        embed.setColor("#03F783");
        return message.channel.send({embeds: [embed]});
    }
};