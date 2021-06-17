module.exports = {
    name: "Suggest a command",
    usage: "suggest",
    rateLimit: 5,
    categories: ["tools"],
    detailedHelp: "Suggests a random command for you to use",
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["suggest", "suggestcmd", "suggestcommand"],
    run: async function run(context, bot) {
        let command = bot.commandObjects[bot.util.arrayRand(Object.keys(bot.commandObjects).filter((cmd)=>
            !bot.commandObjects[cmd].hidden &&
            !(context.getBool("wholesome") && bot.commandObjects[cmd].unwholesome) &&
            !(context.guild  && !context.channel.nsfw && bot.commandObjects[cmd].nsfw) &&
            !context.getBool(`${bot.commandObjects[cmd].commands[0]}.disable`)
        ))]
        let output = `**${command.name}:**\n`;
        if(command.detailedHelp)
            output += `_${command.detailedHelp}_\n`;
        output += `${context.getSetting("prefix")}${command.usage}`;
        return context.send(output);
    }
}
