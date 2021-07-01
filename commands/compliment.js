module.exports = {
    name: "Compliment",
    usage: "compliment :person+",
    categories: ["fun"],
    rateLimit: 10,
    detailedHelp: "Give someone a nice, if not occasionally creepy compliment.",
    usageExample: "compliment @Big P",
    responseExample: "@Big P, you could have a career as a phone sex line operator",
    commands: ["compliment", "complement", "complament"],
    run: function run(context, bot) {
        const term = context.options.person;
        if(term.toLowerCase() === bot.client.user.username.toLowerCase() ||
            term.indexOf(bot.client.user.id) > -1 ||
            (term.toLowerCase() === context.guild?.me?.nickname?.toLowerCase())){
            return context.sendLang("COMPLIMENT_SELF_COMPLIMENT");
        }
        return context.sendLang(`COMPLIMENT_${bot.util.intBetween(1, 27)}`, {term});
    },
};

