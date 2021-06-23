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
    run: async function (context, bot) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Respawning ${process.env.SHARD_COUNT} shards...`);
        embed.setColor(0xff0000);
        context.send({embeds: [embed]});
        bot.rabbit.event({type: "respawn"});
    }
};