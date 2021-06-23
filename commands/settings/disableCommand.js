/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) disableCommand
 *  ════╝
 */
module.exports = {
    name: "Disable Command",
    usage: "disableCommand :command",
    commands: ["disablecommand", "dc"],
    run: async function (context, bot) {
        let command = context.options.command;

        command = command.toLowerCase().replace(context.getSetting("prefix"), "");

        if (!bot.commands[command])
            return context.sendLang("SETTINGS_ENABLE_INVALID", {command: context.command, arg: context.options.command});

        if (context.getBool(`${command}.disable`))
            return context.sendLang("SETTINGS_DISABLE_DISABLED", {arg: context.command, command});

        await bot.config.set(context.guild.id, command + ".disable", true);
        return context.sendLang("SETTINGS_DISABLE_SUCCESS", {command});
    }
};