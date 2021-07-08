/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
const Util = require("../../util/Util");
module.exports = {
    name: "Add Meme",
    usage: "add :name :image?+",
    commands: ["add"],
    run: async function (context, bot) {
        if (!context.guild.id)
            return context.sendLang("GENERIC_DM_CHANNEL");
        if (context.getSetting("meme.disallowAdding"))
            return context.sendLang("MEME_DISABLED");
        if (context.getSetting("meme.disallowUserAdding") && context.getSetting("meme.disallowUserAdding").indexOf(context.user.id) > -1)
            return context.sendLang("MEME_BANNED");

        try {
            let meme = context.options.image;
            if (!meme) {
                meme = await Util.GetImage(bot, context);
                if (!meme)
                    return context.sendLang({content: "MEME_ENTER_URL", ephemeral: true});
            }

            const newMemeName = context.options.name.toLowerCase();
            if (newMemeName.startsWith("http"))
                return context.sendLang({content: "MEME_ENTER_URL", ephemeral: true});

            const memeCheckResult = await bot.database.getMeme(newMemeName, context.guild.id);
            if (memeCheckResult[0] && memeCheckResult[0].server !== "global")
                return context.sendLang("MEME_ADD_EXISTS");

            if(meme.length > 1000)
                return context.send({content: `Your meme must be < 1000 characters. Yours is ${meme.length} characters.`, ephemeral: true});

            await bot.database.addMeme(context.user.id, context.guild.id, newMemeName, meme);
            return context.sendLang("MEME_ADD_SUCCESS");
        } catch (e) {
            bot.raven.captureException(e);
            return context.sendLang("MEME_ADD_ERROR");
        }
    }
};