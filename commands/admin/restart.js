/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) restart
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Restart",
    usage: "restart",
    commands: ["restart", "respawn"],
    run: async function(message, args, bot){
        let embed = new Discord.RichEmbed();
        embed.setTitle(`Respawning ${bot.client.shard.count} shards...`);
        embed.setColor(0xff0000);
        message.channel.send(embed);
        bot.client.shard.send({type: "respawn"});
    }
};