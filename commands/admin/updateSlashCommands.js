
const contextTypeMap = {
    user: 2,
    text: 3,
    message: 3,
}

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

            let subCategories = {};
            for(let commandID in bot.commandObjects){
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if (!commandData.slashOptions || commandData.hidden || !commandData.slashCategory) continue;
                if(!subCategories[commandData.slashCategory])
                    subCategories[commandData.slashCategory] = [];
                subCategories[commandData.slashCategory].push(commandData);
            }
            let commandOutput = [];
            for(let categoryID in subCategories){
                if(!subCategories.hasOwnProperty(categoryID))continue;
                commandOutput.push({
                    name: categoryID,
                    description: "Sub-category "+categoryID,
                    options: subCategories[categoryID].map((command)=>({
                        name: command.commands[0],
                        description: command.name,
                        options: command.slashOptions,
                        type: 1,
                    })),
                    type: 1,
                })
            }
            console.log(JSON.stringify(commandOutput));
            for (let commandID in bot.commandObjects) {
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if (!commandData.slashOptions || commandData.hidden || commandData.slashCategory) continue;
                let slashCommand = {
                    name: commandData.commands[0],
                    description: commandData.name,
                    defaultPermission: !commandData.disabled && !bot.config.getBool(server ? server : "global", `${commandData.commands[0]}.disable`),
                    options: commandData.slashOptions,
                    type: 1
                };
                commandOutput.push(slashCommand);
                if (commandOutput.length >= 99) break;
            }

            for (let commandID in bot.commandObjects) {
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if(!commandData.contextMenu)continue;
                if (commandData.hidden) continue;
                commandOutput.push({
                    name: `${commandData.contextMenu.prefix || "Use in"} /${commandData.commands[0]}`,
                    type: contextTypeMap[commandData.contextMenu.type],
                });
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