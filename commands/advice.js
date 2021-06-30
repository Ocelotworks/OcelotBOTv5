module.exports = {
    name: "Wise Advice",
    usage: "advice",
    rateLimit: 10,
    detailedHelp: "Get some great advice from the wise elders.",
    usageExample: "advice",
    responseExample: "📜 `man who fart in church sit in own pew`",
    categories: ["fun"],
    commands: ["advice", "advise", "wise"],
    run: function (context, bot) {
        return context.sendLang(`ADVICE_${bot.util.intBetween(0, 21)}`);
    },
};