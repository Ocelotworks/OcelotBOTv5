const Discord = require('discord.js');

module.exports = {
    name: "Info",
    usage: "info",
    commands: ["info"],
    run: async function (message, args, bot, data) {

        let authorPlants = data.plants[message.author.id];
        let pages = authorPlants.chunk(3);

        bot.util.standardPagination(message.channel, pages, async function(page, index) {
            let embed = new Discord.RichEmbed();
            embed.setColor(0x189F06);
            embed.setAuthor(data.weedbux[message.author.id] + " WeedBux", bot.client.user.avatarURL);

            for(let i = 0; i < page.length; i++){
                let plant = index * page.length + i;
                let value = data.plants[message.author.id][plant];

                embed.addField("Plant " + (plant), data.status[value.statusIndex][value.age]);
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
        }, true, 30000, {"💧":data.water(message.author.id), "✂":data.trimPlants(message.author.id)});

        /*async function listPlants() {
            let embed = new Discord.RichEmbed();
            let authorPlants = data.plants[message._auth.id];
            let pages = authorPlants.chunk(3);


            embed.setColor(0x189F06);
            embed.setAuthor(data.weedbux[message.author.id] + " WeedBux", bot.client.user.avatarURL);
            let length = 1;

            try {
                data.plants[message.author.id].forEach(function (value) {
                    embed.addField("Plant " + length, data.status[value.statusIndex][value.age]);
                    embed.addField(":droplet:", bot.util.prettySeconds(value.waterTime), true);
                    try {
                        let test = data.ageInterval[value.age] - value.growTime;
                        embed.addField(":clock1:", bot.util.prettySeconds(data.ageInterval[value.age] - value.growTime), true);
                    } catch {
                        //Caught if a plant is ready to harvest, I'll improve this later
                        embed.addField(":clock1:", "Ready to harvest", true);
                    }
                    embed.addField(":heart:", value.health + "%", true);
                    embed.addBlankField(false);
                    length++;
                });
            } catch (e) {
                //ignore
                bot.logger.log(e);
            }


            return embed
        }

        let sentMessage = await message.channel.send("", await listPlants());

        await sentMessage.react("💧");
        await sentMessage.react("✂");

        sentMessage.awaitReactions(async function processReaction(reaction, user) {
            if (user.id === bot.client.user.id) return false;

            let embed = undefined;

            if (user.id === message.author.id) {
                if (reaction.emoji.name === "💧") { //Move forwards
                    data.water(message.author.id);
                    embed = await listPlants()
                } else if (reaction.emoji.name === "✂") { //Move backwards
                    data.trimPlants(message.author.id);
                    embed = await listPlants(message.author.id);
                }
                sentMessage.edit("", embed);
            }

            reaction.remove(user);

            return true;
        }, {
            time: 60000
        }).then(function removeReactions() {
            if (sentMessage.deleted) {
                bot.logger.log(`Weed info response for ${message.id} was deleted before the reactions expired.`);
            } else {
                bot.logger.log(`Reactions on !weed info ${message.id} have expired.`);
                sentMessage.clearReactions();
            }
        })*/
    }
};