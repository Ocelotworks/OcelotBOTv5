/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Server Search",
    usage: "search :name+",
    commands: ["serversearch", "ss", "search", "gs", "guildsearch"],
    noCustom: true,
    run: async function (context, bot) {
        const serverName = `%${context.options.name}%`;
        let results = await bot.database.searchServer(serverName);

        if(results.length === 0)
            return context.send({content: "Couldn't find any servers containing that phrase."});

        if(results.length === 1)
            return context.send({content: `Found one matching server: '**${results[0].name}**' with ID \`${results[0].server}\``, components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, `si ${results[0].server}`))]});

        let output = `Found ${results.length} matching servers\n`;

        for(let i = 0; i < results.length; i++){
            const result = results[i];
            output += `'**${result.name}**' - \`${result.server}\`\n`
        }

        return context.send({content: Strings.Truncate(output, 2000)});
    }
};