const columnify = require('columnify');
module.exports = {
    name: "List Custom Functions",
    usage: "list",
    commands: ["list"],
    run: async function (message, args, bot) {
        let functions = await bot.database.getCustomFunctions(message.guild.id);
        if(functions.length === 0)return message.channel.send(`You have no custom functions set up! To create one, type ${args[0]} add`);

        let header = `Use the 'id' field below to view/edit/delete functions.\n\`\`\`yaml\n`
        let chunkedFunctions = functions.chunk(5);
        return bot.util.standardPagination(message.channel, chunkedFunctions, async function (functions, index) {
            let formatted = [];
            for (let i = 0; i < functions.length; i++) {
                let func = functions[i];
                formatted.push({
                    "id :: ": func.id + " ::",
                    type: func.type,
                    trigger: func.type === "SCHEDULED" ? func.trigger.split("/")[1] : func.trigger,
                });
            }
            return header + columnify(formatted) + "\n```";
        });

    }
}