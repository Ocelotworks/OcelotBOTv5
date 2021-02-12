module.exports = {
    name: "Suggest a command",
    usage: "suggest",
    rateLimit: 5,
    categories: ["tools"],
    detailedHelp: "Suggests a random command for you to use",
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["suggest", "suggestcmd", "suggestcommand"],
    run: async function run(message, args, bot) {
        let command = bot.commandObjects[bot.util.arrayRand(Object.keys(bot.commandObjects).filter((cmd)=>
            !bot.commandObjects[cmd].hidden &&
            !(message.getBool("wholesome") && bot.commandObjects[cmd].unwholesome) &&
            !(message.guild  && !message.channel.nsfw && bot.commandObjects[cmd].nsfw) &&
            !message.getBool(`${bot.commandObjects[cmd].commands[0]}.disable`)
        ))]
        let output = `**${command.name}:**\n`;
        if(command.detailedHelp)
            output += `_${command.detailedHelp}_\n`;
        output += `${message.getSetting("prefix")}${command.usage}`;
        message.channel.send(output);
    }
}
