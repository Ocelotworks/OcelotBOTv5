const request = require('request');
const key = require('config').get("Commands.define.key");
const Discord = require('discord.js');
module.exports = {
    name:  "Dictionary Lookup",
    usage: "define <word>",
    categories: ["tools", "search"],
    detailedHelp: "Find the definition of a word",
    commands: ["define", "def", "dictionary", "dict"],
    run: async function run(message, args, bot) {
        if(!args[1])
            return message.channel.send(`Usage: ${args[0]} <term>`);

        const term = args.slice(1).join(" ");

        let data = await bot.util.getJson(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(term)}?key=${key}`);
        if(!data || data.length === 0)
            return message.channel.send("No results.");
        await bot.util.standardPagination(message.channel, data, async function(result){
            const embed = new Discord.MessageEmbed();

            embed.setTitle(`Definition for "${result.hwi ? result.hwi.hw : term}" (${result.fl}):`);
            embed.setDescription(result.shortdef ? result.shortdef.join("\n") : "Unknown?");
            return embed;
        })
    }
};