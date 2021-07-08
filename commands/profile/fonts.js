/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) fonts
 *  ════╝
 */

module.exports = {
    name: "View Fonts",
    usage: "fonts",
    commands: ["fonts", "font"],
    run: async function (context, bot) {
        const result = await bot.database.getProfileOptions("font");
        let output = "Fonts:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.cost > 0 ? ` (<:points:817100139603820614>**${background.cost.toLocaleString()}**)` : ""}: \nΤype ${context.command} set font ${background.key}\n`;
        }
        context.send(output);
    }
};
