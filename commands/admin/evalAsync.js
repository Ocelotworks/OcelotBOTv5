/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/02/2019
 * ╚════ ║   (ocelotbotv5) evalAsync
 *  ════╝
 */
module.exports = {
    name: "Eval Local Async",
    usage: "evalasync :script+",
    commands: ["evalasync"],
    noCustom: true,
    slashHidden: true,
    run: async function (context, bot) {
        try {
            let output = `\`\`\`\n${await eval(`(async function(){${context.options.script}})`)()}\n\`\`\``;
            return context.send(output);
        } catch (e) {
            return context.send("Error\n```\n" + e + "\n```");
        }
    }
};