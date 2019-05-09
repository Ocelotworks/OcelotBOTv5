const Discord = require('discord.js');

module.exports = {
    name: "Info",
    usage: "info",
    commands: ["info"],
    run: async function (message, args, bot, data) {

        let authorPlants = data.getPlants()[message.author.id];
        let pages = authorPlants.chunk(3);
        //console.log(authorPlants[authorPlants.length-1]);

        bot.util.standardPagination(message.channel, pages, async function(page, index) {
            let embed = new Discord.RichEmbed();
            embed.setColor(0x189F06);
            embed.setAuthor(data.weedbux[message.author.id] + " WeedBux", bot.client.user.avatarURL);

            for(let i = 0; i < page.length; i++){
                let plant = index * page.length + i;
                let value = data.getPlants()[message.author.id][plant];

                embed.addField("Plant " + (plant+1), data.status[value.statusIndex][value.age]);
                console.log("A " + value.waterTime);
                embed.addField(":droplet:", bot.util.prettySeconds(value.waterTime), true);
                try {
                    embed.addField(":clock1:", bot.util.prettySeconds(data.ageInterval[value.age] - value.growTime), true);
                } catch {
                    //Caught if a plant is ready to harvest, I'll improve this later
                    embed.addField(":clock1:", "Ready to harvest", true);
                }
                embed.addField(":heart:", value.health + "%", true);
                embed.addBlankField(false);
            }

            return embed;
        }, true, 60000, {"💧":data.waterPlants, "✂":data.trimPlants});
    }
};