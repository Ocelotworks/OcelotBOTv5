
module.exports = {
    name: "Update Slash Commands",
    usage: "updateslashcommands [guild]",
    commands: ["updateslashcommands", "usc"],
    noCustom: true,
    run: async function (message, args, bot) {
        let server;
        if(args[2]){
            server = args[2].toLowerCase() === "this" ? message.guild.id : args[2];
        }

        let commandOutput = [];

        for(let commandID in bot.commandObjects){
            if(!bot.commandObjects.hasOwnProperty(commandID))continue;
            let commandData = bot.commandObjects[commandID];
            if(!commandData.slashOptions)continue;
            if(commandData.hidden)continue;
            let slashCommand = {
                name: commandData.commands[0],
                description: commandData.name,
                defaultPermission: !commandData.disabled && !bot.config.getBool(server ? server : "global", `${commandData.commands[0]}.disable`),
                options: commandData.slashOptions
            };
            commandOutput.push(slashCommand);
            if(commandOutput.length >= 100)break;
        }
        await bot.client.application.commands.set(commandOutput, server);
        if(server)
            return message.channel.send(`Set ${commandOutput.length} slash commands for ${server}`);
        return message.channel.send(`Set ${commandOutput.length} slash commands.`);
    }
};