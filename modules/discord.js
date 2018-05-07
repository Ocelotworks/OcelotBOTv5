const Discord = require('discord.js');

module.exports = {
    name: "Discord.js Integration",
    init: function(bot){

        Discord.Message.prototype.replyLang = async function(message, values){
           return this.channel.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.Message.prototype.editLang = async function(message, values){
            return this.edit(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };


        bot.client = new Discord.Client();

        bot.client.on("ready", function discordReady(){
            bot.logger.log(`Logged in as ${bot.client.user.tag}!`)
        });


        bot.client.login();

    }
};