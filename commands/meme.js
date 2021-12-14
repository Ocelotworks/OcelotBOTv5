/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Meme Storage",
    usage: "meme",
    commands: ["meme"],
    categories: ["tools"],
    nestedDir: "meme",
    run: async function run(context, bot) {
        if(!context.options.command)
            return bot.commandObjects["nestedCommandHelp.js"].run(context, bot);
        try {
            const memeResult = await bot.database.getMeme(context.options.command?.toLowerCase(), context.message.guild ? context.message.guild.id : "global");
            if (memeResult[0]) {
                return context.message.channel.send(memeResult[0].meme);
            }
            return context.message.replyLang("MEME_NOT_FOUND");
        } catch (e) {
            bot.raven.captureException(e);
            return context.message.replyLang("MEME_ERROR");
        }
    }
};