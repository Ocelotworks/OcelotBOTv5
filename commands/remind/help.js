
module.exports = {
    name: "Help",
    usage: "helpt",
    commands: ["help", "commands", "usage"],
    run: async function(message, args, bot){
        return message.channel.send(`To set a reminder, type the time or a duration and then your message. e.g ${args[0]} in 10 minutes "fix reminders"\nTo manage your current reminders, type **${args[0]} list**`);
    }
};