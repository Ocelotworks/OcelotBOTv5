/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) giveBadge
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Give Badge",
    usage: "giveBadge <user> <id>",
    commands: ["givebadge"],
    run: async function(message, args, bot){
       let id = args[3];
       let user = message.mentions.users.first();
       await bot.database.giveBadge(user.id, id);
       const badge = (await bot.database.getBadge(id))[0];
       let embed = new Discord.RichEmbed();
       embed.setThumbnail(`https://ocelot.xyz/badge.php?id=${id}`);
       embed.setTitle(`You just earned ${badge.name}`);
       embed.setDescription(`${badge.desc}\nNow available on your **${message.getSetting("prefix")}profile**`);
       embed.setColor("#3ba13b");
       message.channel.send(user, embed);
    }
};