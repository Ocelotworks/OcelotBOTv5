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
    run: async function(message, args, bot){
        let command = args[2];
        if(!command)
            return message.channel.send(`:bangbang: Please enter a command to disable. e.g ${args[0]} ${args[1]} barcode`);

        command = command.toLowerCase().replace(message.getSetting("prefix"), "");

        if(!bot.commands[command])
            return message.channel.send(`:bangbang: Invalid command. You must use the name of the command, like ${args[0]} ${args[1]} barcode`);

        if(message.getBool(`${command}.disable`))
            return message.channel.send(`:bangbang: That command is already disabled. To re-enable it, do ${args[0]} enablecommand ${command}`);

        await bot.database.setSetting(message.guild.id, `${command}.disable`, true);
        await bot.config.reloadCacheForServer(message.guild.id);

        message.channel.send(`:white_check_mark: Successfully disabled ${command}`);
    }
};