const request = require('request');
const key = require('config').get("Commands.define.key");
const Discord = require('discord.js');
module.exports = {
    name:  "Dictionary Lookup",
    usage: "define <word>",
    categories: ["tools", "fun"],
    commands: ["define", "def", "dictionary", "dict"],
    run: function run(message, args, bot) {
        if(!args[1])
            return message.channel.send(`Usage: ${args[0]} <term>`);

        const term = encodeURIComponent(args.slice(1).join(" "));

        request({uri:`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(term)}?key=${key}`}, function(err, resp, body){
           if(err)
               return message.replyLang("GENERIC_ERROR");

           try{
               const data = JSON.parse(body);
               if(!data || data.length === 0)
                   return message.channel.send("No results.");
               bot.util.standardPagination(message.channel, data, async function(result){
                   const embed = new Discord.RichEmbed();

                   embed.setTitle(`Definition for "${result.hwi ? result.hwi.hw : term}" (${result.fl}):`);
                   embed.setDescription(result.shortdef ? result.shortdef.join("\n") : "Unknown?");
                   return embed;
               })
           }catch(e){
               bot.raven.captureException(e);
               message.channel.send("Definition not found.");
           }


        });


    }
};