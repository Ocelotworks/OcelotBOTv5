module.exports = {
    name: "Rate",
    usage: "rate :thing?+",
    categories: ["fun"],
    commands: ["rate", "rating"],
    run: function run(context, bot) {
        if(context.options.thing?.toLowerCase() === "djungelskog")
            return context.send(`:thinking: I rate this \`11/10\``);
        return context.send(`:thinking: I rate this \`${bot.util.intBetween(0, 10)}/10\``);
    }
};