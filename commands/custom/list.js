const columnify = require('columnify');
const Util = require("../../util/Util");
module.exports = {
    name: "List Custom Functions",
    usage: "list",
    commands: ["list"],
    run: async function (context, bot) {
        let functions = await bot.database.getCustomFunctions(context.guild.id);
        if(functions.length === 0)return context.send("CUSTOM_LIST_NONE");

        let header = `Use the 'id' field below to view/edit/delete functions.\n\`\`\`yaml\n`
        let chunkedFunctions = functions.chunk(10);
        return Util.StandardPagination(bot, context, chunkedFunctions, async function (functions, index) {
            let formatted = [];
            for (let i = 0; i < functions.length; i++) {
                let func = functions[i];
                formatted.push({
                    "id :: ": func.id + " ::",
                    type: func.type,
                    trigger: func.type === "SCHEDULED" ? func.trigger.split("/")[1] : func.trigger,
                });
            }
            return {content: header + columnify(formatted) + "\n```"};
        });

    }
}