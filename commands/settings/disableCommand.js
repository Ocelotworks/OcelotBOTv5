/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) disableCommand
 *  ════╝
 */
module.exports = {
    name: "Disable Command",
    usage: "disableCommand <command>",
    commands: ["disablecommand", "dc"],
    run: async function (message, args, bot) {
        let command = args[2];
        if (!command)
            return message.replyLang("SETTINGS_DISABLE_NONE", {command: args[0], arg: args[1]});

        command = command.toLowerCase().replace(message.getSetting("prefix"), "");

        if (!bot.commands[command])
            return message.replyLang("SETTINGS_ENABLE_INVALID", {command: args[0], arg: args[1]});

        if (message.getBool(`${command}.disable`))
            return message.replyLang("SETTINGS_DISABLE_DISABLED", {arg: args[0], command});

        await bot.config.set(message.guild.id, command + ".disable", true);
        message.replyLang("SETTINGS_DISABLE_SUCCESS", {command});
    }
};