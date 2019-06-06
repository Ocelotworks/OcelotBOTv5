/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

const Discord = require('discord.js');
const util = require('util');

module.exports = {
    name: "Info",
    usage: "info",
    commands: ["info"],
    run: async function (message, args, bot, data) {

        let authorPlants = data.getPlants()[message.author.id];

        Object.keys(data.getPlants()).forEach(async function (key) {
            data.getPlants()[key].forEach(function (value) {
                value.doPlant();
                if (value.health <= 0) {
                    bot.logger.log("Deleting Plant");
                    value.dead = true;
                    bot.database.deletePlant(value);
                }
            });
        });
        bot.database.saveAllPlants(data.getPlants());

        if (authorPlants === undefined || authorPlants.length === 0) {
            message.channel.send("No plants. Buy some with `!weed buy`");
            return;
        }

        let pages = authorPlants.chunk(3);
        let weedbuxString = await bot.lang.getTranslation(message.author.id, "WEED_WEEDBUX", {"weedbux": message.getSetting("weed.bux")}, message.author.id);
        //console.log(authorPlants[authorPlants.length-1]);

        bot.util.standardPagination(message.channel, pages, async function (page, index) {
            let embed = new Discord.RichEmbed();
            embed.setColor(0x189F06);
            embed.setAuthor(weedbuxString, bot.client.user.avatarURL);
            embed.addField("✂ to harvest all harvest-able plants", "💧 to water all plants to full.");

            for (let i = 0; i < page.length; i++) {
                let plant = (index * 3) + i;
                let value = data.getPlants()[message.author.id][plant];
                if (value.dead) {
                    break;
                }

                embed.addField("Plant " + (plant + 1), data.status[value.statusIndex][value.age]);
                embed.addField(":droplet:", bot.util.prettySeconds((value.waterTime - data.epoch()) / 1000), true);
                if (value.age !== 5) {
                    embed.addField(":clock1:", bot.util.prettySeconds((value.growTime - data.epoch()) / 1000), true);
                } else {
                    embed.addField(":clock1:", "Ready to harvest", true);
                }
                embed.addField(":heart:", value.health + "%", true);
                if (args[2] === "debug") {
                    if (!(bot.admins.indexOf(message.author.id) === -1)) {
                        embed.addField("Debug", util.inspect(value), false);
                    }
                }
                embed.addBlankField(false);
            }

            return embed;
        }, true, 60000, {"💧": data.waterPlants, "✂": data.trimPlants});
    }
};
