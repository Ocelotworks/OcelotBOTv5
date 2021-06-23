/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) enableCommand
 *  ════╝
 */
module.exports = {
    name: "Enable Command",
    usage: "enableCommand :command",
    commands: ["enablecommand", "ec"],
    run: async function (context, bot) {
        let command = context.options.command;

        command = command.toLowerCase().replace(message.getSetting("prefix"), "");

        if (!bot.commands[command])
            return context.replyLang("SETTINGS_ENABLE_INVALID", {command: context.command, arg: context.options.command});


        if (!context.getBool(`${command}.disable`))
            return message.replyLang("SETTINGS_ENABLE_ENABLED", {arg: context.command, command});


        await bot.config.set(message.guild.id, command + ".disable", false);

        message.replyLang("SETTINGS_ENABLE_SUCCESS", {command});
    }
};