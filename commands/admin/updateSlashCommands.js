
module.exports = {
    name: "Update Slash Commands",
    usage: "updateslashcommands :guild?",
    commands: ["updateslashcommands", "usc"],
    noCustom: true,
    run: async function (context, bot) {
        try {
            let server;
            if (context.options.guild)
                server = context.options.guild.toLowerCase() === "this" ? context.guild.id : context.options.guild;

            let commandOutput = [];
            for (let commandID in bot.commandObjects) {
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if (!commandData.slashOptions) continue;
                if (commandData.hidden) continue;
                let slashCommand = {
                    name: commandData.commands[0],
                    description: commandData.name,
                    defaultPermission: !commandData.disabled && !bot.config.getBool(server ? server : "global", `${commandData.commands[0]}.disable`),
                    options: commandData.slashOptions
                };
                commandOutput.push(slashCommand);
                if (commandOutput.length >= 80) break;
            }
            await context.send(`Putting ${commandOutput.length} slash commands...`);
            await bot.client.application.commands.set(commandOutput, server);
            if (server)
                return context.send(`Set ${commandOutput.length} slash commands for ${server}`);
            return context.send(`Set ${commandOutput.length} slash commands.`);
        }catch(e){
            return context.send(e.message);
        }
    }
};