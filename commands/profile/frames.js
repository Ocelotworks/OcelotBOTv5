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
    run: async function (message, args, bot) {
        const result = await bot.database.getProfileOptions("frame");
        let output = "Frames:\n";
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            output += `For **${background.name}**${background.premium ? " (<:ocelotbot:533369578114514945> **Premium**)" : ""}: \nΤype ${args[0]} set frame ${background.key}\n`;
        }
        message.channel.send(output);
    }
};
