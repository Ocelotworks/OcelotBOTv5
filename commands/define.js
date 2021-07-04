const key = require('config').get("API.dictionary.key");
const Discord = require('discord.js');
const Util = require("../util/Util");
module.exports = {
    name:  "Dictionary Lookup",
    usage: "define :term+",
    categories: ["tools", "search"],
    detailedHelp: "Find the definition of a word",
    usageExample: "define seven",
    responseExample: "**seven**: the number that is one more than six",
    commands: ["define", "def", "dictionary", "dict"],
    run: async function run(context, bot) {
        const term = context.options.term;

        let data = await bot.util.getJson(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(term)}?key=${key}`);
        if(!data || data.length === 0)
            return context.replyLang("DEFINE_NO_DEFINITION");
        await Util.StandardPagination(bot, context, data, async function(result){
            const embed = new Discord.MessageEmbed();

            console.log(result.shortdef ? result.shortdef.join("\n") : "Unknown?");
            embed.setTitle(`Definition for "${result.hwi ? result.hwi.hw : term}" (${result.fl}):`);
            embed.setDescription(result.shortdef ? result.shortdef.join("\n") : "Unknown?");
            return {embeds: [embed]};
        })
    }
};