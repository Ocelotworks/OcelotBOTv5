module.exports = {
    name: "Rate",
    usage: "rate <thing>",
    categories: ["fun"],
    commands: ["rate", "rating"],
    run: function run(message, args, bot) {
        if (args[1] && args[1].toLowerCase() === "djungelskog")
            message.channel.send(`:thinking: I rate this \`11/10\``);
        else
            message.channel.send(`:thinking: I rate this \`${bot.util.intBetween(0, 10)}/10\``);
    }
};