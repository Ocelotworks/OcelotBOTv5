/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) enableCommand
 *  ════╝
 */
module.exports = {
    name: "Enable Command",
    usage: "enableCommand :targetcommand",
    commands: ["enablecommand", "ec"],
    run: async function (context, bot) {
        let command = context.options.targetcommand.toLowerCase().replace(context.getSetting("prefix"), "");

        if (!bot.commands[command])
            return context.replyLang("SETTINGS_ENABLE_INVALID");

        if (!context.getBool(`${command}.disable`))
            return context.replyLang("SETTINGS_ENABLE_ENABLED", {arg: context.command, targetCommand: command});

        await bot.config.set(context.guild.id, command + ".disable", false);

        return context.replyLang("SETTINGS_ENABLE_SUCCESS", {targetCommand: command});
    }
};