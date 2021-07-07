/**
 * Created by Peter on 01/07/2017.
 */

const Util = require("../util/Util");
const Strings = require("../util/String");
module.exports = {
    name: "Urban Dictionary",
    usage: "defineud :term+",
    categories: ["tools", "fun"],
    detailedHelp: "Find the urban definition of a word",
    usageExample: "defineud peng",
    responseExample: "Definition for **peng**: \nA very [positive] word used casualy [to show] how [attracted] etc you are to something/someone",
    commands: ["defineud", "ud", "urban", "urbandictionary"],
    run: async function run(context, bot) {
        const term = context.options.term;
        context.defer();
        let data = await bot.util.getJson(`http://api.urbandictionary.com/v0/define?term=${term}`);

        if(data?.list?.length > 0) {
            return Util.StandardPagination(bot, context, data.list, async function (page) {
                page.definition = Strings.Truncate(page.definition, 800);
                page.example = Strings.Truncate(page.example, 800);
                return {content: context.getLang("UD_DEFINITION", page)};
            }, true, data.list.map((p,i)=>({
                label: Strings.Truncate(p.word, 25),
                description: Strings.Truncate(p.definition, 50),
                value: `${i}`
            })));
        }

        return context.sendLang({content: "UD_NO_DEFINITIONS", ephemeral: true});
    }
};