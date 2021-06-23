/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) boards
 *  ════╝
 */
module.exports = {
    name: "View Boards",
    usage: "boards",
    commands: ["boards", "board"],
    run: async function (message, args, bot) {
        const result = await bot.database.getProfileOptions("board");
        let output = "Boards:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.cost > 0 ? ` (<:points:817100139603820614>**${background.cost.toLocaleString()}**)` : ""}: \nΤype ${context.command} set board ${background.key}\n`;
        }
        message.channel.send(output);
    }
};