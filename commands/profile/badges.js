/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) badges
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Badges",
    usage: "badges [category]",
    commands: ["badges"],
    run: async function(message, args, bot){
        if(!args[2]){
            const result = await bot.database.getBadgeTypes();
            let categories = {};
            let output = "Badges:\n";
            for (let i = 0; i < result.length; i++) {
                const badge = result[i];
                if(!badge.display)continue;
                const category = badge.series || "special";
                if(categories[category])
                    categories[category].push(badge.emoji);
                else
                    categories[category] = [badge.emoji];
            }

            let embed = new Discord.RichEmbed();
            embed.setTitle("Profile Badges");
            embed.setDescription(`To see more info about the categories, do **${args[0]} ${args[1]} _category_**\nTo see more info about the badges you currently have, do **${args[0]} ${args[1]} mine**`);
            for(let category in categories){
                if(categories.hasOwnProperty(category))
                    embed.addField(category, categories[category].join(" "));
            }

            message.channel.send("", embed);

        }else{
            let series = args[2].toLowerCase();
            if(series === "special")
                series = null;

            let result;

            if(series === "mine"){
                result = await bot.database.getProfileBadges(message.author.id);
            }else{
                result = await bot.database.getBadgesInSeries(series);
            }

            if(result.length === 0)
                return message.channel.send(series === "mine" ? `:warning: You don't have any badges! Check out ${args[0]} ${args[1]} to see what badges you can earn.` :
                                                                `:warning: No such category. Try ${args[0]} ${args[1]} for a list of categories.`);

            let output = series === "mine" ? "Your Badges:\n" : `Badges in category **'${args[2]}'**:\n`;
            for (let i = 0; i < result.length; i++) {
                const badge = result[i];
                if (badge.display === 1)
                    output += `${args[3] && args[3] === "ids" ? badge.id : ""}${badge.emoji} **${badge.name}** ${badge.desc}\n`;

            }
            message.channel.send(output);
        }
    }
};