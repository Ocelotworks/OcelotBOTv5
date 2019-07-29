/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/05/2019
 * ╚════ ║   (ocelotbotv5) rule34
 *  ════╝
 */
const request = require('request');
const Discord = require('discord.js');
module.exports = {
    name: "Rule34 Search",
    usage: "rule34 <search>",
    categories: ["nsfw"],
    rateLimit: 50,
    requiredPermissions: ["ATTACH_FILES", "MANAGE_MESSAGES", "ADD_REACTIONS"],
    commands: ["rule34", "r34"],
    vote: true,
    run: async function(message, args, bot){
        if(!args[1])
            return message.channel.send(":bangbang: You must enter a tag to search for");


        let tag = encodeURIComponent(message.content.substring(args[0].length+1).replace(/ /g, "_"));

        request(`https://r34-json-api.herokuapp.com/posts?tags=${tag}`, function(err, resp, body){
            if(err)
                return message.replyLang("GENERIC_ERROR");

            try{
                let data = JSON.parse(body);
                if(data.length === 0)
                    return message.channel.send(":warning: No results");

                bot.util.standardPagination(message.channel, data, async function(page, index){

                    let embed = new Discord.RichEmbed();

                    embed.setAuthor(message.author.username, message.author.displayAvatarURL);
                    embed.setImage(page.file_url);
                    embed.addField("Score", page.score);
                    embed.setFooter(`Page ${index+1}/${data.length}`);


                    return embed;
                }, true);


            }catch(e){
                bot.raven.captureException(e);
                message.replyLang("GENERIC_ERROR");
            }
        });
    }
};