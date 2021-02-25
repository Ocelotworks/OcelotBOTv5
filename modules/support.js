/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/04/2019
 * ╚════ ║   (ocelotbotv5) support
 *  ════╝
 */
const Discord = require('discord.js');
const changePrefix = /.*(change|custom).*prefix.*/gi;
module.exports = {
    name: "Support Server Specific Functions",
    init: function(bot){
        bot.client.on("message", async function onMessage(message) {
            if (message.guild && message.guild.id === "322032568558026753" && !message.author.bot && bot.client.user.id == "146293573422284800") {
                if (message.content.indexOf("discord.gg") > -1)
                    return message.delete();

                if (changePrefix.exec(message.content)) {
                    bot.util.replyTo(message, "To change the prefix, type !settings set prefix %\nWhere % is the prefix you want.");
                }
            }
        });


        bot.client.on("ready", function(){
            if(bot.client.guilds.cache.has("322032568558026753")){

            }
        })


    }
};