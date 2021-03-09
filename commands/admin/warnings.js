/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) warnings
 *  ════╝
 */
const config = require('config');
module.exports = {
    name: "Warnings",
    usage: "warnings",
    commands: ["warnings"],
    run: async function (message, args, bot) {
        let warnings = await bot.util.getJson(`http://${config.get("General.BrokerHost")}:${config.get("General.BrokerPort")}/warnings`);
        if (Object.keys(warnings).length === 0)
            return message.channel.send(":white_check_mark: No Warnings!");

        let output = ":warning: **Warnings:**\n";
        for (let warningID in warnings) {
            if (!warnings.hasOwnProperty(warningID)) continue;
            output += `(${warningID}) ${warnings[warningID]}\n`;
        }

        message.channel.send(output);
    }
};