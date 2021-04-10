/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) backgrounds
 *  ════╝
 */
module.exports = {
    name: "View Backgrounds",
    usage: "backgrounds",
    commands: ["backgrounds", "background"],
    run: async function (message, args, bot) {
        const result = await bot.database.getProfileOptions("background");
        let output = "Backgrounds:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.cost > 0 ? ` (<:points:817100139603820614>**${background.cost.toLocaleString()}**)` : ""}: \nΤype ${args[0]} set background ${background.key}\n`;
        }
        output += `**Get a custom background with Ocelot Premium, for more info type: ${message.getSetting("prefix")}premium**`;
        return message.channel.send(output);
    }
};