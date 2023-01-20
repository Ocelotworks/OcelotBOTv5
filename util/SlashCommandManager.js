module.exports = class SlashCommandManager {
    static option = {
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

    static type = {
        CHAT_INPUT: 1,
        USER: 2,
        MESSAGE: 3,
    }

    static contextTypeMap = {
        user: this.type.USER,
        text: this.type.MESSAGE,
        message: this.type.MESSAGE,
    }



    static GetCommandPacks(packs, commandObjects){
        let commandOutput = [];

        // Get the subcategories and add them as commands
        let subCategories = SlashCommandManager.GetSubCategories(commandObjects, packs);
        for(let categoryID in subCategories) {
            if (!subCategories.hasOwnProperty(categoryID)) continue;
            commandOutput.push(SlashCommandManager.SubCategoryToSlashCommand(subCategories[categoryID], categoryID));
        }

        // Load all the text commands in this pack
        for (let commandID in commandObjects) {
            if (!commandObjects.hasOwnProperty(commandID)) continue;
            const commandData = commandObjects[commandID];
            if(!packs.includes(commandData.commandPack) || !this.IsTextCommand(commandData))continue;
            commandOutput.push(this.CommandDataToSlashCommand(commandData));
            if (commandOutput.length >= 99) break;
        }

        for (let commandID in commandObjects) {
            if (!commandObjects.hasOwnProperty(commandID)) continue;
            let commandData = commandObjects[commandID];
            if(!packs.includes(commandData.commandPack) || !SlashCommandManager.IsContextCommand(commandData))continue;
            commandOutput.push(this.CommandDataToContextCommand(commandData));
        }

        return commandOutput;
    }


    /**
     * Returns a mapping of category -> array of commandData
     * @param commandObjects bot.commandObjects
     * @param packs
     * @constructor
     * @returns {[key: string]: Object[]} an array of commandData for each sub category key
     */
    static GetSubCategories(commandObjects, packs = ["default"]){
        let subCategories = {};
        for(let commandID in commandObjects){
            if (!commandObjects.hasOwnProperty(commandID)) continue;
            let commandData = commandObjects[commandID];
            if (!commandData.slashOptions || commandData.hidden || !commandData.slashCategory || commandData.slashHidden || !packs.includes(commandData.commandPack)) continue;
            if(!subCategories[commandData.slashCategory])
                subCategories[commandData.slashCategory] = [];
            subCategories[commandData.slashCategory].push(commandData);
        }
        return subCategories;
    }


    /**
     * Returns an array of slash commands for each command in a subCategory
     * @returns {Object[]} an array of slash command data
     * @constructor
     * @param subCategory
     * @param categoryID
     */
    static SubCategoryToSlashCommand(subCategory, categoryID){
        return {
            name: categoryID,
            description: "Sub-category "+categoryID,
            // options: subCategories[categoryID].map((command)=>({
            //     name: command.commands[0],
            //     description: command.name,
            //     options: command.slashOptions,
            //     type: this.option.SUB_COMMAND,
            // })),
            options: subCategory.map((d)=>this.CommandDataToSlashCommand(d, this.option.SUB_COMMAND)),
            type: this.type.CHAT_INPUT,
        };
    }

    /**
     * Creates a slash command from a commands commandData
     * @param commandData
     * @param type
     * @constructor
     */
    static CommandDataToSlashCommand(commandData, type = this.type.CHAT_INPUT){
        return {
            name: commandData.commands[0],
            description: commandData.name,
            // defaultPermission: !commandData.disabled && !bot.config.getBool(server ? server : "global", `${commandData.commands[0]}.disable`),
            options: commandData.slashOptions,
            dmPermission: !commandData.guildOnly,
            // defaultMemberPermissions: commandData.settingsOnly ? "ADMINISTRATOR" : undefined,
            type,
        };
    }

    static CommandDataToContextCommand(commandData){
        return {
            name: `${commandData.contextMenu.prefix || "Use in"} /${commandData.commands[0]}`,
            type: this.contextTypeMap[commandData.contextMenu.type],
        }
    }
    static IsTextCommand(commandData){
        return commandData.slashOptions && !commandData.hidden && !commandData.slashCategory && !commandData.slashHidden
    }

    static IsContextCommand(commandData){
        return commandData.contextMenu && !commandData.nsfw && !commandData.hidden && !commandData.slashHidden
    }


}