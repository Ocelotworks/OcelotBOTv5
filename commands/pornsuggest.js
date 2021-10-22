/**
 * Ported by Neil - 30/04/18
 */
const Discord = require('discord.js');

const request = require('request');
const Util = require("../util/Util");
const Strings = require("../util/String");
const naughtyRegex = /(young|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|(thir|four|fif|six|seven?)teen)|(1?)[0-7]( ?)(year(s?)?)( ?)(old?)|bab(y|ie)|toddler)(s?)|girl|boy|child|kid|dog|cat|horse|animal|beast/gi;
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest :search+",
    commands: ["pornsuggest"],
    rateLimit: 50,
    nsfw: true,
    vote: true,
    pointsCost: 15,
    requiredPermissions: ["MANAGE_MESSAGES"],
    categories: ["nsfw", "search"],
    run: function run(context, bot) {
        let search = context.options.search;

        if(naughtyRegex.test(search)){
            return context.send(":warning: No results.");
        }

        request(`https://www.pornmd.com/api/v1/video-search?orientation=straight&query=${encodeURIComponent(search.replace(/['"<>\[\]]/g, ""))}&start=1&ajax=true&format=json`, async function getPorn(err, resp, body){
            if(err)
                return context.replyLang("GENERIC_ERROR");
            try{
                let data = JSON.parse(body);
                let images = data.itemList;
                if(!images || images.length === 0)
                    return context.send(":warning: No results.");
                await Util.StandardPagination(bot, context, images, async function(page, index){
                    let embed = new Discord.MessageEmbed();
                    embed.setAuthor(page.source);
                    embed.setTimestamp(new Date(page.createdAt));
                    embed.setTitle(page.title);
                    embed.setImage(page.thumbnailUrl);
                    const url = "https://pornmd.com"+page.hashedUrl;
                    embed.setURL(url);
                    embed.setDescription(`Rating: ${page.rating}\nDuration: ${page.duration}\n[Click here to watch](${url})`);
                    embed.setFooter(`Page ${index+1}/${images.length}`);
                    return {embeds: [embed]};
                }, true, images.map((p,i)=>({
                    label: Strings.Truncate(p.title, 25),
                    description: Strings.Truncate(p.source, 50),
                    value: `${i}`
                })));
            }catch(e){
                console.log(body);
                bot.raven.captureException(e);
                console.log(e);
                context.replyLang("GENERIC_ERROR");
            }
        });
    }
};