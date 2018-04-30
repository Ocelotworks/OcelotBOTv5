const Discord = require('discord.js');

module.exports = {
    name: "Discord.js Integration",
    init: function(bot){

        Discord.Message.prototype.replyLang = async function(message, values){
           this.channel.send(await bot.lang.getTranslation(this.guild.id, message, values));
        };


        bot.client = new Discord.Client();

        bot.client.on("ready", function discordReady(){
            bot.logger.log(`Logged in as ${bot.client.user.tag}!`)
        });


        bot.client.login();

    }
};