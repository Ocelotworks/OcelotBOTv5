/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/04/2019
 * ╚════ ║   (ocelotbotv5) support
 *  ════╝
 */
module.exports = {
    name: "Support Server Specific Functions",
    init: function(bot){
        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
            if(message.guild && message.guild.id === "322032568558026753"){
                if(!message.author.bot && message.content.indexOf("discord.gg") > -1){
                    message.delete();
                }
            }
        }));


    }
};