module.exports = {
    name: "Command Info",
    usage: "info <command>",
    commands: ["version", "v", "info", "commandinfo"],
    run: async function(message, args, bot){
        if(!args[2])
            return message.channel.send("Usage: !admin version [command]");
        let command = bot.commandUsages[args[2].toLowerCase()];
        if(!command)
            return message.channel.send("No such command is loaded.");
        let output = `**'${args[2].toLowerCase()}' Info:**\n`;
        output += `File: ${command.id}\n`
        output += `Version: \`${command.crc}\`\n`;
        output += `Categories: ${command.categories.join(",")}\n`;
        output += `Rate Limit Score: ${command.rateLimit}\n`;
        output += `Aliases: ${command.commands.join(", ")}`;
        message.channel.send(output);
    }
};