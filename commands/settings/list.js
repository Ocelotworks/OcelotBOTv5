/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
module.exports = {
    name: "View Settings",
    usage: "list",
    commands: ["list", "view"],
    run: async function (message, args, bot, data) {
        let output = "```diff\nAvailable Settings:\n";
        for (let setting in data.settings) {
            if (data.settings.hasOwnProperty(setting)) {
                let settingInfo = data.settings[setting];
                output += `+${settingInfo.name}${message.getSetting(settingInfo.setting) ? " (Currently '" + message.getSetting(settingInfo.setting) + "')" : ""}\n`;
                output += `-${settingInfo.help}\n`;
                output += ` Set with ${context.command} set ${setting} ${settingInfo.value || "value"}\n`;
                output += "----\n";
            }
        }
        output += "\n```";
        message.channel.send(output);
    }
};