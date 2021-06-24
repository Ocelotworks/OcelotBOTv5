/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) badges
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Badges",
    usage: "badges :category?",
    commands: ["badges"],
    run: async function (context, bot) {
        if (!context.options.category) {
            const result = await bot.database.getBadgeTypes();
            let categories = {};
            let output = "Badges:\n";
            for (let i = 0; i < result.length; i++) {
                const badge = result[i];
                if (!badge.display) continue;
                const category = badge.series || "special";
                if (categories[category])
                    categories[category].push(badge.emoji);
                else
                    categories[category] = [badge.emoji];
            }

            let embed = new Discord.MessageEmbed();
            embed.setTitle("Profile Badges");
            embed.setDescription(`To see more info about the categories, do **${context.command} ${context.options.command} _category_**\nTo see more info about the badges you currently have, do **${context.command} ${context.options.command} mine**`);
            for (let category in categories) {
                if (categories.hasOwnProperty(category))
                    embed.addField(category, categories[category].join(" "));
            }

            context.send({embeds: [embed]});

        } else {
            let series = context.options.category.toLowerCase();
            if (series === "special")
                series = null;

            let result;

            if (series === "mine") {
                result = await bot.database.getProfileBadges(context.user.id);
            } else {
                result = await bot.database.getBadgesInSeries(series);
            }

            if (result.length === 0)
                return context.send(series === "mine" ? `:warning: You don't have any badges! Check out ${context.command} ${context.options.command} to see what badges you can earn.` :
                    `:warning: No such category. Try ${context.command} ${context.options.command} for a list of categories.`);

            let output = series === "mine" ? "Your Badges:\n" : `Badges in category **'${context.options.category}'**:\n`;
            for (let i = 0; i < result.length; i++) {
                const badge = result[i];
                if (badge.display === 1)
                    output += `${badge.emoji} **${badge.name}** ${badge.desc}\n`;

            }
            context.send(output);
        }
    }
};