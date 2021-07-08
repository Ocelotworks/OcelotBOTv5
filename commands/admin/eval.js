module.exports = {
    name: "Eval Script",
    usage: "eval :script+",
    commands: ["eval"],
    noCustom: true,
    run: async function (context, bot) {
        let sentMessage = await context.send("Evaluating on all shards...");
        let result = await bot.rabbit.broadcastEval(context.options.script);
        let output = "```\n";
        result.forEach(function (line) {
            output += line + "\n";
        });
        output += "\n```";
        return context.edit(output, sentMessage);
    }
};