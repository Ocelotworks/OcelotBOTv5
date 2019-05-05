/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Meme",
    usage: "meme help",
    commands: ["meme"],
    categories: ["fun", "memes"],
    init: function init(bot){
        bot.util.standardNestedCommandInit('meme');
    },
    run: async function run(message, args, bot) {
        bot.util.standardNestedCommand(message, args, bot, "meme", null, async function invalidUsage(){
            if(!args[1])
                return message.channel.send(`:bangbang: Invalid Usage. Try ${args[0]} help`);

            try {
                const memeResult = await bot.database.getMeme(args[1].toLowerCase(), message.guild ? message.guild.id : "global");

                if (memeResult[0]) {
                    message.channel.send(memeResult[0].meme);
                } else {
                    message.replyLang("MEME_NOT_FOUND");
                }
            }catch(e){
                message.replyLang("MEME_ERROR");
                bot.raven.captureException(e);
            }
        });

    }
};