/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) frames
 *  ════╝
 */

module.exports = {
    name: "View Frames",
    usage: "frames",
    commands: ["frames", "frame"],
    run: async function (context, bot) {
        const result = await bot.database.getProfileOptions("frame");
        let output = "Frames:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.cost > 0 ? ` (<:points:817100139603820614>**${background.cost.toLocaleString()}**)` : ""}: \nΤype ${context.command} set frame ${background.key}\n`;
        }
        return context.send(output);
    }
};
