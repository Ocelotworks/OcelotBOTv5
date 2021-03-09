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
    run: async function (message, args, bot) {
        const result = await bot.database.getProfileOptions("font");
        let output = "Fonts:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.premium ? " (<:ocelotbot:533369578114514945> **Premium**)" : ""}: \nΤype ${args[0]} set font ${background.key}\n`;
        }
        message.channel.send(output);
    }
};
