/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) disableCommand
 *  ════╝
 */
module.exports = {
    name: "Disable Command",
    usage: "disableCommand :targetcommand",
    commands: ["disablecommand", "dc"],
    argDescriptions: {
        targetcommand: {name: "The command to disable", autocomplete: true}
    },
    autocomplete: function(input, interaction, bot) {
        return Object.keys(bot.commands).filter((k)=>k.includes(input) && !bot.config.getBool(interaction.guildId, `${k}.disable`)).map((k)=>({name: k, value: k})).slice(0, 25);
    },
    run: async function (context, bot) {
        let command = context.options.targetcommand.toLowerCase().replace(context.getSetting("prefix"), "");

        if (!bot.commands[command])
            return context.sendLang("SETTINGS_ENABLE_INVALID");

        if (context.getBool(`${command}.disable`))
            return context.sendLang("SETTINGS_DISABLE_DISABLED", {arg: context.command, targetCommand: command});

        await bot.config.set(context.guild.id, command + ".disable", true);
        return context.sendLang("SETTINGS_DISABLE_SUCCESS", {targetCommand: command});
    }
};