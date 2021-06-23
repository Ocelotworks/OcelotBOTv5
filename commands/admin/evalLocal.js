module.exports = {
    name: "Eval Script Locally",
    usage: "evallocal :script+",
    commands: ["evallocal"],
    noCustom: true,
    run: async function (context, bot) {
        try {
            let output = `\`\`\`\n${eval(context.options.script)}\n\`\`\``;
            return context.send(output);
        } catch (e) {
            return context.send("Error\n```\n" + e + "\n```");
        }
    }
};