/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 17/01/2019
 * ╚════ ║   (ocelotbotv5) count
 *  ════╝
 */

module.exports = {
    name: "Count",
    usage: "count",
    categories: ["tools"],
    commands: ["count"],
    hidden: true,
    slashOptions: [{type: "STRING", name: "phrase", description: "The phrase to look up", required: true}],
    run: async function run(context, bot) {
        if (!context.getSetting("ocelotworks")) return;
        if (context.args && !context.args[1])
            return context.send({content: "You must enter a search term"})

        const phrase = context.message ? context.message.content.substring(context.args[0].length + 1).trim() : context.options.phrase;

        context.defer();
        let result = await bot.database.getPhraseCount(phrase);
        context.send(`'${phrase}' has been said **${result[0]['COUNT(*)']} times.**`);
    }
};