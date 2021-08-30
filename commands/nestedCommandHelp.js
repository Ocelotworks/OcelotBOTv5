const Strings = require("../util/String");
module.exports = {
    name: "Nested Command Help",
    detailedHelp: "This is a pseudo-command used by nested commands as their default help command",
    usage: "",
    usageExample: "",
    commands: ["nestedCommandHelp"],
    categories: [],
    hidden: true,
    run: async function(context, bot){
        if(!context.commandData.subCommands)
            return context.send("nestedCommandHelp ran for command with no sub commands - tell Big P!");
        const subCommands = Object.keys(context.commandData.subCommands).reduce((acc, key)=>{
            let data = context.commandData.subCommands[key];
            acc[data.id] = data;
            return acc;
        }, {})
        let output = `\n\`\`\`asciidoc\n${context.commandData.name} help:\n========\n`;
        for(let id in subCommands){
            if(!subCommands.hasOwnProperty(id))continue;
            const subCommand = subCommands[id];
            if(subCommand.hidden)continue;
            if(context.getBool(`${context.command}.${subCommand.commands[0]}.disable`))continue;
            output += `${subCommand.name} :: ${context.getSetting("prefix")}${context.command} ${Strings.PrintCommandUsage(subCommand.pattern)}\n`
        }
        output += "\n```";
        return context.send({content: output, ephemeral: true});
    },
};