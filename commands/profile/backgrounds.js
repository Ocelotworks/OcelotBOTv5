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
    run: async function(message, args, bot){
        const result = await bot.database.getProfileOptions("background");
        let output = "Backgrounds:\n";
        for(let i = 0; i < result.length; i++){
            const background = result[i];
            output += `For **${background.name}**${background.premium ? " (<:ocelotbot:533369578114514945> **Premium**)" : ""}: \nΤype ${args[0]} set background ${background.key}\n`;
        }
        output += `**Get a custom background with Ocelot Premium, for more info type: ${message.getSetting("prefix")}premium**`;
        message.channel.send(output);
    }
};