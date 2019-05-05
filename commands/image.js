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
let cache = {
    sfw: {},
    nsfw: {}
};
const naughtyRegex = /((sexy|nude|naked)?)( ?)(young( ?)(girl|boy?)|child|kid(die?)|(1?)[0-7]( ?)(year(s?)?)( ?)(old?)|bab(y|ie)|toddler)(s?)( ?)(sexy|porn|sex|naked|nude|fuck(ed?))/gi;
module.exports = {
    name: "Google Image Search",
    usage: "image <text>",
    rateLimit: 50,
    requiredPermissions: ["ATTACH_FILES", "MANAGE_MESSAGES", "ADD_REACTIONS"],
    commands: ["image", "images", "im", "googleimage"],
    categories: ["image"],
    run:  async function(message, args, bot){
        if(args.length > 1){
            const query = message.cleanContent.substring(args[0].length+1);
            if(naughtyRegex.test(query)){
                bot.logger.warn("Blocking query");
                let embed = new Discord.RichEmbed();
                embed.setTitle(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IMAGE_BLOCKED_QUERY_TITLE", {}, message.author.id));
                embed.setDescription(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IMAGE_BLOCKED_QUERY_DESCRIPTION", {}, message.author.id));
                embed.setImage("https://i.imgur.com/iHZJOnG.jpg");
                return message.channel.send("", embed);
            }
            message.channel.startTyping();
            try {
                let images;
                let type = message.channel.nsfw ? "nsfw" : "sfw";
                if(cache[type][query]) {
                    bot.logger.log("Using cached copy for "+query);
                    images = cache[type][query];
                }else {
                    images = await client.search(query, {safe: message.channel.nsfw ? "off" : "high"});
                    cache[type][query] = images;
                }
                if(images.length === 0)
                    return message.replyLang(message.channel.nsfw ? "IMAGE_NO_IMAGES_NSFW" : "IMAGE_NO_IMAGES");

                let embed = new Discord.RichEmbed();
                embed.setAuthor(message.author.username, message.author.avatarURL);
                embed.setTimestamp(new Date());
                embed.setTitle(`Image results for '${query}'`);
                if(message.getSetting("image.useThumbnails") || !images[0].url)
                    embed.setImage(images[0].thumbnail.url);
                else
                    embed.setImage(images[0].url);
                embed.setDescription(images[0].description);
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

                    if(message.getSetting("image.useThumbnails"))
                        embed.setImage(images[index].thumbnail.url);
                    else
                        embed.setImage(images[index].url);
                    embed.setDescription(images[index].description);
                    embed.setFooter(`Page ${index+1}/${images.length}`);
                    sentMessage.edit("", embed);

                    reaction.remove(user);

                    return true;
                }, {
                    time: 60000
                }).then(function removeReactions() {
                    if(sentMessage.deleted){
                        bot.logger.log(`!image response for ${message.id} was deleted before the reactions expired.`);
                    }else{
                        bot.logger.log(`Reactions on !image ${message.id} have expired.`);
                        sentMessage.clearReactions();
                    }
                })
            }catch(e){
                if(e.message === "Response code 403 (Forbidden)"){
                    message.replyLang("REMOVEBG_QUOTA");
                }else{
                    message.replyLang("GENERIC_ERROR");
                }
                console.log(e);
                bot.raven.captureException(e);
            }finally{
                message.channel.stopTyping(true);
            }
        }else{
            message.channel.send(":bangbang: You must supply a search query. Try **"+args[0]+" cute puppies**")
        }
    }
};