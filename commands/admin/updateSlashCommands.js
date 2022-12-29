const Discord = require("discord.js");


const type = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3,
}
const option = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
}

const contextTypeMap = {
    user: type.USER,
    text: type.MESSAGE,
    message: type.MESSAGE,
}


module.exports = {
    name: "Update Slash Commands",
    usage: "updateslashcommands :guild?",
    commands: ["updateslashcommands", "usc"],
    noCustom: true,
    run: async function (context, bot) {
        let commandOutput = [];
        try {
            let server;
            if (context.options.guild)
                server = context.options.guild.toLowerCase() === "this" ? context.guild.id : context.options.guild;

            // Creates the sub-categories and adds each command to it's respective sub-category
            let subCategories = {};
            for(let commandID in bot.commandObjects){
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if (!commandData.slashOptions || commandData.hidden || !commandData.slashCategory) continue;
                if(!subCategories[commandData.slashCategory])
                    subCategories[commandData.slashCategory] = [];
                subCategories[commandData.slashCategory].push(commandData);
            }
            // Adds all the subCategories as actual commands
            for(let categoryID in subCategories){
                if(!subCategories.hasOwnProperty(categoryID))continue;
                commandOutput.push({
                    name: categoryID,
                    description: "Sub-category "+categoryID,
                    options: subCategories[categoryID].map((command)=>({
                        name: command.commands[0],
                        description: command.name,
                        options: command.slashOptions,
                        type: option.SUB_COMMAND,
                    })),
                    type: type.CHAT_INPUT,
                })
            }
            for (let commandID in bot.commandObjects) {
                if (!bot.commandObjects.hasOwnProperty(commandID)) continue;
                let commandData = bot.commandObjects[commandID];
                if (!commandData.slashOptions || commandData.hidden || commandData.slashCategory) continue;
                let slashCommand = {
                    name: commandData.commands[0],
                    description: commandData.name,
                    // defaultPermission: !commandData.disabled && !bot.config.getBool(server ? server : "global", `${commandData.commands[0]}.disable`),
                    options: commandData.slashOptions,
                    dmPermission: !commandData.guildOnly,
                    // defaultMemberPermissions: commandData.settingsOnly ? "ADMINISTRATOR" : undefined,
                    type: type.CHAT_INPUT
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
            console.log(JSON.stringify(commandOutput))

            await context.send(`Putting ${commandOutput.length} slash commands...`);
            await bot.client.application.commands.set(commandOutput, server);
            if (server)
                return context.send(`Set ${commandOutput.length} slash commands for ${server}`);
            return context.send(`Set ${commandOutput.length} slash commands.`);
        }catch(e){
            context.send({files: [new Discord.MessageAttachment(Buffer.from(JSON.stringify(commandOutput, null, 1)), "slash.json")]})
            return context.send(e.message);
        }
    }
};

