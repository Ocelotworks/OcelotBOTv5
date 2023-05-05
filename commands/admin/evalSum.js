const Discord = require("discord.js");
module.exports = {
    name: "Eval Sum",
    usage: "evalsum :script+",
    commands: ["evalsum"],
    noCustom: true,
    run: async function (context, bot) {
        let sentMessage = await context.send("Evaluating on all shards...");
        let result = await bot.rabbit.broadcastEval(context.options.script);
        let sum = result.reduce((line, acc)=>isNaN(line) ? acc+line : acc)

        return context.edit(`Sum: \`${sum}\``, sentMessage);
    }
};