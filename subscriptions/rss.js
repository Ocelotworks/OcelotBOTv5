const Parser = require('rss-parser');
const parser = new Parser();
const Discord = require('discord.js');
module.exports = {
    name: "RSS Feed",
    id: "rss",
    alias: [],
    check: async function check(url, lastCheck){
        const then = new Date(lastCheck);
        const feed = await parser.parseURL(url);
        const output = [];
        for(let i = 0; i < feed.items.length; i++){
            const item = feed.items[i];
            if(new Date(item.pubDate) > then){
                output.push(item);
            }
        }
        return output;
    },
    added: function added(server, channel, user, url, lastCheck, bot){
        if(!bot.client.channels.has(channel))return;
        const now = new Date();
        const check = lastCheck.getTime()+60000;
        bot.logger.log(`Next check ${check} in ${check-now}ms`);
        setTimeout(async function checkTimer(){
            bot.logger.log(`Checking RSS ${url}`);
            const results = await module.exports.check(url, lastCheck);
            if(results.length > 0){
                for(let i = 0; i < results.length; i++) {
                    const result = results[i];
                    console.log(result);
                    let embed = new Discord.RichEmbed();
                    embed.setTitle(result.title);
                    embed.setDescription(result.description || result.contentSnippet || result.content);
                    embed.setTimestamp(result.pubDate);
                    embed.setAuthor(result.author);
                    embed.setURL(result.link);
                    bot.client.channels.get(channel).send("", embed);
                }
            }
            await bot.database.updateLastCheck(server, channel, "rss", url);
            module.exports.added(server, channel, user, url, now, bot);
        }, check-now);
    }
};
