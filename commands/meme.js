/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Meme Storage",
    usage: "meme help",
    commands: ["meme"],
    categories: ["tools"],
    slashHidden: true,
    init: function init(bot) {
        bot.util.standardNestedCommandInit('meme');
    },
    run: async function run(context, bot) {
        bot.util.standardNestedCommand(context.message, context.args, bot, "meme", null, async function invalidUsage() {
            if (!context.args[1])
                return context.channel.send(`:bangbang: Invalid Usage. Try ${context.args[0]} help`);

            try {
                const memeResult = await bot.database.getMeme(context.args[1].toLowerCase(), context.message.guild ? context.message.guild.id : "global");

                if (memeResult[0]) {
                    context.message.channel.send(memeResult[0].meme);
                } else {
                    context.message.replyLang("MEME_NOT_FOUND");
                }
            } catch (e) {
                context.message.replyLang("MEME_ERROR");
                bot.raven.captureException(e);
            }
        });

    }
};