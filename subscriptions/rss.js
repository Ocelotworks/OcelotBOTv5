const Parser = require('rss-parser');
const parser = new Parser();
const Discord = require('discord.js');
module.exports = {
    name: "RSS Feed",
    id: "rss",
    alias: [],
    validate: function(input){
        if(input.startsWith("http"))
            return null;
        return ":warning: RSS must be a valid URL, for example: https://status.discordapp.com/history.rss";
    },
    check: async function check(url, lastCheck){
        const then = new Date(lastCheck);
        const feed = await parser.parseURL(url);
        let results = [];
        let output = [];
        for(let i = 0; i < feed.items.length; i++){
            const item = feed.items[i];
            if(new Date(item.pubDate) > then){
                results.push(item);
            }
        }
        for(let i = 0; i < results.length; i++) {
            const result = results[i];
            let embed = new Discord.MessageEmbed();
            embed.setTitle(result.title);
            embed.setDescription(result.description || result.contentSnippet || result.content);
            if(result.pubDate)
                embed.setTimestamp(result.pubDate);
            embed.setAuthor(result.author);
            embed.setURL(result.link);
            output.push(embed);
        }
        return output;
    }
};
