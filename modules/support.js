/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/04/2019
 * ╚════ ║   (ocelotbotv5) support
 *  ════╝
 */

const changePrefix = /.*(change|custom).*prefix.*/gi;
module.exports = {
    name: "Support Server Specific Functions",
    init: function(bot){
        bot.client.on("message", async function onMessage(message) {
            if (message.guild && message.guild.id === "322032568558026753" && !message.author.bot) {
                if (message.content.indexOf("discord.gg") > -1)
                    return message.delete();

                if (changePrefix.exec(message.content))
                    message.reply("To change the prefix, type !settings set prefix %\nWhere % is the prefix you want.");
            }
        });


    }
};