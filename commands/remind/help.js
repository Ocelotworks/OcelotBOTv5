
module.exports = {
    name: "Help",
    usage: "help",
    commands: ["help", "commands", "usage"],
    run: async function(message, args, bot){
        let output = `To set a reminder, type the time or a duration and then your message. e.g ${args[0]} in 10 minutes "fix reminders"\nTo manage your current reminders, type **${args[0]} list**`;
        if(message.member.hasPermission("MANAGE_CHANNELS"))
            output += `\nTo set a recurring reminder, type **${args[0]} every** then a time period and a message. e.g **${args[0]} every 5 minutes "ocelot best bot"**`;
        return message.channel.send(output);
    }
};