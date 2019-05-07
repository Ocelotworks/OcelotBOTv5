const Discord = require('discord.js');

module.exports = {
    name: "Info",
    usage: "info",
    commands: ["info"],
    run: async function(message, args, bot, data){

        let embed = new Discord.RichEmbed();
        embed.setColor(0x189F06);
        embed.setAuthor(data.weedbux[message.author.id] + " WeedBux", bot.client.user.avatarURL);
        let length = 1;

        try {
            data.plants[message.author.id].forEach(function (value) {
                embed.addField("Plant " + length, data.status[value.statusIndex][value.age]);
                embed.addField(":droplet:", (value.waterTime / 3600) + "h", true);
                embed.addField(":clock1:", (value.growTime / data.ageInterval[value.age])*100 + "%", true);
                embed.addField(":heart:", value.health + "%", true);
                embed.addBlankField(false);
                length++;
            });
        } catch (e) {
            //ignore
        }



        message.channel.send("", embed);
    }
};