module.exports = {
    name: "Help",
    usage: "help",
    commands: ["help", "commands", "usage"],
    run: async function (context, bot) {
        let output = `To set a reminder, type the time or a duration and then your message. e.g ${context.command} in 10 minutes "fix reminders"\nTo manage your current reminders, type **${context.command} list**`;
        if (context.member && context.channel.permissionsFor(context.member).has("MANAGE_CHANNELS"))
            output += `\nTo set a recurring reminder, type **${context.command} every** then a time period and a message. e.g **${context.command} every 5 minutes "ocelot best bot"**`;
        return context.send({content: output, ephemeral: true});
    }
};