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
            return message.channel.send(`:bangbang: Please enter a command to enable. e.g ${args[0]} ${args[1]} barcode`);

        command = command.toLowerCase().replace(message.getSetting("prefix"), "");

        if(!bot.commands[command])
            return message.channel.send(`:bangbang: Invalid command. You must use the name of the command, like ${args[0]} ${args[1]} barcode`);

        if(!message.getBool(`${command}.disable`))
            return message.channel.send(`:bangbang: That command is already enabled. To disable it, do ${args[0]} disablecommand ${command}`);

        await bot.database.setSetting(message.guild.id, `${command}.disable`, false);
        await bot.config.reloadCacheForServer(message.guild.id);

        message.channel.send(`:white_check_mark: Successfully enabled ${command}`);
    }
};