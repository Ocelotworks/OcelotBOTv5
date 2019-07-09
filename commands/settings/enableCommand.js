/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) enableCommand
 *  ════╝
 */
module.exports = {
    name: "Enable Command",
    usage: "enableCommand <command>",
    commands: ["enablecommand", "ec"],
    run: async function(message, args, bot){
        let command = args[2];
        if(!command)
            return message.replyLang("SETTINGS_ENABLE_NONE", {command: args[0], arg: args[1]});

        command = command.toLowerCase().replace(message.getSetting("prefix"), "");

        if(!bot.commands[command])
            return message.replyLang("SETTINGS_ENABLE_INVALID", {command: args[0], arg: args[1]});


        if(!message.getBool(`${command}.disable`))
            return message.replyLang("SETTINGS_ENABLE_ENABLED", {arg: args[0], command});


        await bot.database.setSetting(message.guild.id, `${command}.disable`, false);
        await bot.config.reloadCacheForServer(message.guild.id);

        message.replyLang("SETTINGS_ENABLE_SUCCESS", {command});
}
};