/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) image
 *  ════╝
 */
const GoogleImages = require('google-images');
const {axios} = require('../util/Http');
const config = require('config')
const Discord = require('discord.js');
const Embeds = require('../util/Embeds');
const Util = require("../util/Util");
const Strings = require("../util/String");
let client = new GoogleImages(config.get("API.googleImages.cse"), config.get("API.googleImages.key"));
const naughtyRegex = /((sexy|nude|naked)?)( ?)(young( ?)(girl|boy?)|child|kid(die?)|(1?)[0-7]( ?)(year(s?)?)( ?)(old?)|bab(y|ie)|toddler)(s?)( ?)(sexy|porn|sex|naked|nude|fuck(ed?))/gi;
module.exports = {
    name: "Google Image Search",
    usage: "image :text+",
    rateLimit: 80,
    detailedHelp: "Search Google Images",
    usageExample: "image cute puppies",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["image", "images", "im", "googleimage"],
    vote: true,
    pointsCost: 2,
    categories: ["image", "search"],
    handleError: function(context){
        return context.sendLang("IMAGE_NO_TEXT");
    },
    run: async function (context, bot) {
        const query = context.options.text;
        if (naughtyRegex.test(query)) {
            bot.logger.warn("Blocking query");
            let embed = new Discord.MessageEmbed();
            embed.setTitle(context.getLang("IMAGE_BLOCKED_QUERY_TITLE", {}));
            embed.setDescription(context.getLang("IMAGE_BLOCKED_QUERY_DESCRIPTION", {}));
            embed.setImage("https://i.imgur.com/iHZJOnG.jpg");
            return context.send({embeds: [embed]});
        }
        await context.defer();
        try {
            let images;
            const nsfw = (!context.guild || context.channel.nsfw);
            let type = nsfw ? "nsfw" : "sfw";

            if(context.getBool("image.yandex")) {
                try {
                    let result = await bot.redis.cache(`images/supplementary/${type}/${query}`, async () => (await axios.get(`https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI?q=${encodeURIComponent(query)}&pageNumber=1&pageSize=10&safeSearch=${!nsfw}`, {
                        headers: {
                            "x-rapidapi-key": config.get("API.contextual.key"),
                            "x-rapidapi-host": "contextualwebsearch-websearch-v1.p.rapidapi.com",
                            "useQueryString": true
                        }
                    })).data);
                    images = result.value.map((result) => ({
                        url: result.url,
                        thumbnail: {url: result.thumbnail},
                        description: result.title,
                    }));
                }catch(e){
                    bot.raven.captureException(e);
                    bot.logger.error(e);
                    images = await bot.redis.cache(`images/${type}/${query}`, async () => await client.search(query, {safe: nsfw ? "off" : "high"}), 36000)
                }
            } else {
                images = await bot.redis.cache(`images/${type}/${query}`, async () => await client.search(query, {safe: nsfw ? "off" : "high"}), 36000)
                images = images.filter((image) => !image.thumbnail.url.startsWith("x-raw-image") && !image.url.startsWith("x-raw-image"))

            }
            if (images.length === 0)
                return context.sendLang(!context.channel.nsfw ? "IMAGE_NO_IMAGES_NSFW" : "IMAGE_NO_IMAGES");

            const points = (await bot.database.getPoints(context.user.id)).toLocaleString();

            return Util.StandardPagination(bot, context, images, async function (page, index) {
                let embed = new Embeds.PointsEmbed(context, bot);
                await embed.init(points);
                embed.setAuthor(context.user.username, context.user.avatarURL({dynamic: true, format: "png"}));
                embed.setTimestamp(new Date());
                embed.setTitle(`Image results for '${query.substring(0, 200)}'`);
                if (!page.thumbnail.url.startsWith("x-raw-image") && (context.getSetting("image.useThumbnails") || !page.url))
                    embed.setImage(page.thumbnail.url);
                else
                    embed.setImage(page.url);
                embed.setDescription(page.description || "No Description");
                embed.setFooter(`Page ${index + 1}/${images.length}`);
                return {embeds: [embed]};
            }, true, images.map((im,i)=>({
                label: `Page ${i+1}`,
                description: Strings.Truncate(im.description, 25),
                value: `${i}`
            })));
        } catch (e) {
            if (e.message === "Response code 403 (Forbidden)")
                context.sendLang("REMOVEBG_QUOTA");
            else
                context.sendLang("GENERIC_ERROR");
            bot.logger.error(e);
            bot.raven.captureException(e);
        }
    }
};
