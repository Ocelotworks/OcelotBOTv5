/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/05/2019
 * ╚════ ║   (ocelotbotv5) rule34
 *  ════╝
 */
const axios = require('axios');
const Discord = require('discord.js');
const xml2js = require('xml2js');
const Util = require("../util/Util");
const naughtyRegex = /(young|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|(thir|four|fif|six|seven?)teen)|(1?)[0-7]( ?)(year(s?)?)( ?)(old?)|bab(y|ie)|toddler)(s?)|girl|boy|child|kid/gi;
module.exports = {
    name: "Rule34 Search",
    usage: "rule34 :search+",
    usageExample: "rule34 ocelotbot",
    categories: ["nsfw", "search"],
    rateLimit: 50,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rule34", "r34"],
    vote: true,
    pointsCost: 10,
    hidden: true,
    run: async function(context, bot){
        if (naughtyRegex.test(context.options.search)) {
            return context.send({content: ":warning: No results", ephemeral: true});
        }
        let tag = encodeURIComponent(context.options.search.replace(/ /g, "_"));

        const points = (await bot.database.getPoints(context.user.id)).toLocaleString();

        const result = await axios.get(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${tag}`, {responseType: "text"})
        xml2js.parseString(result.data, (err, result)=>{
            if(err)
                return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});

            if(!result.posts || !result.posts.post || result.posts.post.length === 0)
                return context.send({content: ":warning: No results", ephemeral: true});

            return Util.StandardPagination(bot, context, result.posts.post, async function(page, index){
                page = page["$"];
                let embed = new Discord.MessageEmbed();

                embed.setTitle(`Results for '${tag}'`);
                embed.setAuthor(context.user.username, context.user.avatarURL({dynamic: true}));
                embed.setImage(page.file_url);
                embed.addField("Score", page.score);
                if(context.getBool("points.enabled"))
                    embed.setFooter(`${points} • Page ${index + 1}/${result.posts.post.length}`, "https://cdn.discordapp.com/emojis/817100139603820614.png?v=1");
                else
                    embed.setFooter(`Page ${index+1}/${result.posts.post.length}`);

                return {embeds: [embed]};
            }, true);
        })
    }
};