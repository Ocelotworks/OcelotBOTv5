module.exports = {
    name: "Countdowns",
    usage: "countdown",
    accessLevel: 0,
    detailedHelp: "Set a countdown that you can check on",
    usageExample: "countdown to the 25th of December christmas \"It's Christmas Time!\"",
    responseExample: "Got it, **!countdown christmas** will now tell tell you how long until the 25th of December",
    commands: ["countdown", "countup"],
    categories: ["tools"],
    nestedDir: "countdown",
    run: async function run(context, bot) {
        if(!context.options.command || context.options.command === "help"){
            return bot.commands["nestedCommandHelp"](context, bot);
        }

        const countdown = await bot.database.getCountdown(context.options.command.toLowerCase(), context.guild?.id || context.channel.id);

        if(!countdown)
            return context.sendLang({content: "COUNTDOWN_NOT_FOUND", ephemeral: true});

        const now = new Date();
        const time = bot.util.prettySeconds(Math.abs((countdown.target - now) / 1000), context.guild.id, context.user.id);
        return context.sendLang({content: countdown.target>now ? "COUNTDOWN_FUTURE" : "COUNTDOWN_PAST"}, {...countdown, time})
    }
};