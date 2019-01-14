/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) image
 *  ════╝
 */
const GoogleImages = require('google-images');
const config = require('config').get("Commands.image");
const Discord = require('discord.js');
let client = new GoogleImages(config.get("cse"), config.get("key"));
module.exports = {
    name: "Google Image Search",
    usage: "image <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES", "MANAGE_MESSAGES", "ADD_REACTIONS"],
    commands: ["image", "images", "im", "googleimage"],
    categories: ["image", "fun", "memes"],
    run:  async function(message, args, bot){
        if(args.length > 1){
            const query = message.cleanContent.substring(args[0].length+1);
            message.channel.startTyping();
            try {
                let images = await client.search(query, {safe: message.channel.nsfw ? "off" : "high"});
                let embed = new Discord.RichEmbed();
                embed.setAuthor(message.author.username, message.author.avatarURL);
                embed.setTimestamp(new Date());
                embed.setTitle(`Image results for '${query}'`);
                embed.setImage(images[0].thumbnail.url || images[0].url);
                embed.setDescription(images[0].title);
                embed.setFooter(`Page 1/${images.length}`);
                let index = 0;
                let sentMessage = await message.channel.send("", embed);
                await sentMessage.react("⬅");
                await sentMessage.react("➡");
                sentMessage.awaitReactions(async function processReaction(reaction, user) {
                    if (user.id === bot.client.user.id) return false;

                    if (reaction.emoji.name === "➡") { //Move forwards
                        index++;
                    } else if (reaction.emoji.name === "⬅") { //Move backwards
                        index--;
                    }

                    if (index < 0) index = images.length - 1;
                    if (index > images.length - 1) index = 0;

                    embed.setImage(images[index].thumbnail.url || images[index].url);
                    embed.setDescription(images[index].title);
                    embed.setFooter(`Page ${index+1}/${images.length}`);
                    sentMessage.edit("", embed);

                    reaction.remove(user);

                    return true;
                }, {
                    time: 60000
                }).then(function removeReactions() {
                    bot.logger.log(`Reactions on !defineud ${message.id} have expired.`);
                    sentMessage.clearReactions();
                })
            }catch(e){
                console.log(e);
                bot.raven.captureException(e);
            }finally{
                message.channel.stopTyping(true);
            }
        }else{
            message.channel.send("You must supply a ")
        }
    }
};