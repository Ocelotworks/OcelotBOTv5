/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/05/2019
 * ╚════ ║   (ocelotbotv5) rule34
 *  ════╝
 */
const request = require('request');
const Discord = require('discord.js');
const xml2js = require('xml2js');
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

        request(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${tag}`, function(err, resp, body){

            if(err)
                return message.replyLang("GENERIC_ERROR");

            xml2js.parseString(body, (err, result)=>{
                if(err)
                    return message.replyLang("GENERIC_ERROR");

                if(!result.posts.post || result.posts.post.length === 0)
                    return message.channel.send(":warning: No results");

                bot.util.standardPagination(message.channel, result.posts.post, async function(page, index){
                    page = page["$"];
                    let embed = new Discord.MessageEmbed();

                    embed.setAuthor(message.author.username, message.author.avatarURL({dynamic: true}));
                    embed.setImage(page.file_url);
                    embed.addField("Score", page.score);
                    embed.setFooter(`Page ${index+1}/${result.posts.post.length}`);


                    return embed;
                }, true);
            })
        });
    }
};