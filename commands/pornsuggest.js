/**
 * Ported by Neil - 30/04/18
 */
const Discord = require('discord.js');

const request = require('request');
const Util = require("../util/Util");
const Strings = require("../util/String");
let naughtyRegex = /child|kid|baby|babies|toddler|1[0-7]|/gi;
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest :search+",
    commands: ["pornsuggest"],
    rateLimit: 50,
    nsfw: true,
    vote: true,
    requiredPermissions: ["ADD_REACTIONS", "MANAGE_MESSAGES"],
    categories: ["nsfw", "search"],
    run: function run(context, bot) {
        let search = context.options.search;

        // if(naughtyRegex.test(search)){
        //     bot.logger.warn("Blocking query");
        //     let embed = new Discord.MessageEmbed();
        //     embed.setTitle("Search Blocked");
        //     embed.setDescription("I'm not going to jail for your edgy joke");
        //     embed.setImage("https://i.imgur.com/iHZJOnG.jpg");
        //     return context.send({embeds: [embed]});
        // }

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