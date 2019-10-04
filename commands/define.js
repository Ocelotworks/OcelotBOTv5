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

        request({uri:"https://wordsapiv1.p.mashape.com/words/"+encodeURIComponent(term), headers:{"X-Mashape-Key": key}}, function(err, resp, body){
           if(err)
               return message.replyLang("GENERIC_ERROR");

           try{
               const data = JSON.parse(body);
               if(!data || !data.results || data.results.length === 0)
                   return message.channel.send("No results.");
               bot.util.standardPagination(message.channel, data.results, async function(result){
                   const embed = new Discord.RichEmbed();

                   embed.setTitle(`Definition for "${data.word}" (${result.partOfSpeech}):`);
                   embed.setDescription(result.definition);
                   if(result.synonyms)
                    embed.addField("Synonyms", result.synonyms.join(", "));
                   return embed;
               })
           }catch(e){
               bot.raven.captureException(e);
               message.channel.send("Definition not found.");
           }


        });


    }
};