const dateformat = require('dateformat');
module.exports = {
    name: "Random Quote",
    usage: "quote :user? :phrase+?",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["quote"],
    hidden: true,
    run: async function (context, bot) {
        // noinspection EqualityComparisonWithCoercionJS
        if (!context.getBool("ocelotworks")) return;
        const target = context.options.user.toLowerCase() === "anyone" ? null : context.options.user.toLowerCase();
        const phrase = context.options.phrase;
        context.defer();
        const result = await bot.database.getMessageFrom(target, phrase);
        const row = result[0];
        console.log(phrase);
        if (!row)
            return context.send("Couldn't find a message matching that.");

        return context.send(`[${dateformat(new Date(row.time), 'UTC:dd/mm/yy HH:MM:ss Z')}] <${row.user}> ${row.message}\n`);
    }
};