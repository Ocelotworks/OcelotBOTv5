/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/04/2019
 * ╚════ ║   (ocelotbotv5) runCommand
 *  ════╝
 */
const child_process = require('child_process');
module.exports = {
    name: "Run Command",
    usage: "run <command>",
    commands: ["run"],
    run: async function (message, args, bot) {
        let command = message.content.substring(message.content.indexOf(args[2]));
        child_process.exec(command, function (err, stdout, stderr) {
            if (err) {
                message.channel.send("Error: " + err);
            } else {
                message.channel.send(`stdout:\n\`\`\`\n${stdout}\n\`\`\`\nstderr:\`\`\`\n${stderr}\n\`\`\``)
            }
        });
    }
};