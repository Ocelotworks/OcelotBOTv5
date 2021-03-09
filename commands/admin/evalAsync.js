/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/02/2019
 * ╚════ ║   (ocelotbotv5) evalAsync
 *  ════╝
 */
module.exports = {
    name: "Eval Local Async",
    usage: "evalasync <script>",
    commands: ["evalasync"],
    run: async function (message, args, bot) {
        try {
            let output = `\`\`\`\n${eval("(async function(){" + message.content.substring(args[0].length + args[1].length + 2) + "})()")}\n\`\`\``;
            message.channel.send(output);
        } catch (e) {
            message.channel.send("Error\n```\n" + e + "\n```");
        }
    }
};