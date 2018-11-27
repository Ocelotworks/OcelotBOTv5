module.exports = {
    name: "Rate",
    usage: "rate <thing>",
    categories: ["fun"],
    commands: ["rate", "rating"],
    run: function run(message, args, bot) {
       message.channel.send(`:thinking: I rate this \`${bot.util.intBetween(0,10)}/10\``);
    }
};