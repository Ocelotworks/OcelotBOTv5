/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) image
 *  ════╝
 */
const GoogleImages = require('google-images');
const axios = require('axios');
const config = require('config').get("Commands.image");
const Discord = require('discord.js');
let client = new GoogleImages(config.get("cse"), config.get("key"));
const naughtyRegex = /((sexy|nude|naked)?)( ?)(young( ?)(girl|boy?)|child|kid(die?)|(1?)[0-7]( ?)(year(s?)?)( ?)(old?)|bab(y|ie)|toddler)(s?)( ?)(sexy|porn|sex|naked|nude|fuck(ed?))/gi;
module.exports = {
    name: "Google Image Search",
    usage: "image <text>",
    rateLimit: 80,
    detailedHelp: "Search Google Images",
    usageExample: "image cute puppies",
    requiredPermissions: ["ATTACH_FILES", "MANAGE_MESSAGES", "ADD_REACTIONS"],
    commands: ["image", "images", "im", "googleimage"],
    vote: true,
    categories: ["image", "search"],
    run: async function (message, args, bot) {
        if (args.length > 1) {
            const query = message.cleanContent.substring(args[0].length + 1);
            if (naughtyRegex.test(query)) {
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
                const nsfw = (!message.guild || message.channel.nsfw);
                let type = nsfw ? "nsfw" : "sfw";

                if(message.getBool("image.yandex")){
                    let result = await bot.redis.cache(`images/supplementary/${type}/${query}`, ()=>axios.get(`https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI?q=${encodeURIComponent(query)}&pageNumber=1&pageSize=10&safeSearch=${!nsfw}`, {
                        headers: {
                            "x-rapidapi-key": config.get("contextualKey"),
                            "x-rapidapi-host": "contextualwebsearch-websearch-v1.p.rapidapi.com",
                            "useQueryString": true
                        }
                    }));
                    images = result.data.value.map((result)=>({
                        url: result.url,
                        thumbnail: {url: result.thumbnail},
                        description: result.title,
                    }));
                }else {
                    images = await bot.redis.cache(`images/${type}/${query}`, async () => await client.search(query, {safe: nsfw ? "off" : "high"}), 36000)
                    images = images.filter((image) => !image.thumbnail.url.startsWith("x-raw-image") && !image.url.startsWith("x-raw-image"))

                }
                if (images.length === 0)
                    return message.replyLang(!message.channel.nsfw ? "IMAGE_NO_IMAGES_NSFW" : "IMAGE_NO_IMAGES");


                bot.util.standardPagination(message.channel, images, async function (page, index) {
                    let embed = new Discord.MessageEmbed();
                    embed.setAuthor(message.author.username, message.author.avatarURL({dynamic: true, format: "png"}));
                    embed.setTimestamp(new Date());
                    embed.setTitle(`Image results for '${query.substring(0, 200)}'`);
                    if (!page.thumbnail.url.startsWith("x-raw-image") && (message.getSetting("image.useThumbnails") || !page.url))
                        embed.setImage(page.thumbnail.url);
                    else
                        embed.setImage(page.url);
                    embed.setDescription(page.description);
                    embed.setFooter(`Page ${index + 1}/${images.length}`);
                    return embed;
                }, true);
            } catch (e) {
                message.channel.stopTyping(true);
                if (e.message === "Response code 403 (Forbidden)") {
                    message.replyLang("REMOVEBG_QUOTA");
                } else {
                    message.replyLang("GENERIC_ERROR");
                }
                console.log(e);
                bot.raven.captureException(e);
            } finally {
                message.channel.stopTyping(true);
            }
        } else {
            message.channel.send(":bangbang: You must supply a search query. Try **" + args[0] + " cute puppies**")
        }
    }
};
