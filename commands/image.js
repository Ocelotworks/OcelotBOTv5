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
    detailedHelp: "Search Google Images",
    requiredPermissions: ["ATTACH_FILES", "MANAGE_MESSAGES", "ADD_REACTIONS"],
    commands: ["image", "images", "im", "googleimage"],
    vote: true,
    categories: ["image", "search"],
    run:  async function(message, args, bot){
        if(args.length > 1){
            const query = message.cleanContent.substring(args[0].length+1);
            if(naughtyRegex.test(query)){
                bot.logger.warn("Blocking query");
                let embed = new Discord.MessageEmbed();
                embed.setTitle(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IMAGE_BLOCKED_QUERY_TITLE", {}, message.author.id));
                embed.setDescription(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IMAGE_BLOCKED_QUERY_DESCRIPTION", {}, message.author.id));
                embed.setImage("https://i.imgur.com/iHZJOnG.jpg");
                return message.channel.send("", embed);
            }
            message.channel.startTyping();
            try {
                let images;
                let type = (!message.guild || message.channel.nsfw) ? "nsfw" : "sfw";
                if(cache[type][query]) {
                    bot.logger.log("Using cached copy for "+query);
                    images = cache[type][query];
                }else {
                    images = await client.search(query, {safe: message.channel.nsfw ? "off" : "high"});
                    cache[type][query] = images;
                }
                if(images.length === 0)
                    return message.replyLang(!message.channel.nsfw ? "IMAGE_NO_IMAGES_NSFW" : "IMAGE_NO_IMAGES");

                bot.util.standardPagination(message.channel, images, async function(page, index){
                    let embed = new Discord.MessageEmbed();
                    embed.setAuthor(message.author.username, message.author.avatarURL({dynamic: true, format: "png"}));
                    embed.setTimestamp(new Date());
                    embed.setTitle(`Image results for '${query}'`);
                    if(message.getSetting("image.useThumbnails") || !page.url)
                        embed.setImage(page.thumbnail.url);
                    else
                        embed.setImage(page.url);
                    embed.setDescription(page.description);
                    embed.setFooter(`Page ${index+1}/${images.length}`);
                   return embed;
                }, true);
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