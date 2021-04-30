/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
module.exports = {
    name: "Add Meme",
    usage: "add <name> <url>",
    commands: ["add"],
    run: async function (message, args, bot) {
        if (!message.guild.id)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if (message.getSetting("meme.disallowAdding"))
            return message.replyLang("MEME_DISABLED");
        if (message.getSetting("meme.disallowUserAdding") && message.getSetting("meme.disallowUserAdding").indexOf(message.author.id) > -1)
            return message.replyLang("MEME_BANNED");

        try {
            let meme;
            if (!args[3]) {
                meme = await bot.util.getImage(message, args);
                if (!meme)
                    return message.replyLang("MEME_ENTER_URL");
            } else {
                if (message.mentions.users.size > 0 || message.mentions.roles.size > 0 || message.content.indexOf("@everyone") > -1 && message.getSetting("meme.disallowTags"))
                    return message.replyLang("MEME_ROLE");
                meme = message.content.substring(args[0].length + args[1].length + args[2].length + 3)
            }

            if (!args[2]) {
                return message.channel.send(`You need to enter a name. e.g ${args[0]} add ocelotbot`);
            }
            const newMemeName = args[2].toLowerCase();
            if (newMemeName.startsWith("http"))
                return message.replyLang("MEME_ENTER_URL");

            const memeCheckResult = await bot.database.getMeme(newMemeName, message.guild.id);
            if (memeCheckResult[0] && memeCheckResult[0].server !== "global")
                return message.replyLang("MEME_ADD_EXISTS");

            if(meme.length > 1000)
                return message.channel.send(`Your meme must be < 1000 characters. Yours is ${meme.length} characters.`);

            await bot.database.addMeme(message.author.id, message.guild.id, newMemeName, meme);
            message.replyLang("MEME_ADD_SUCCESS");
        } catch (e) {
            message.replyLang("MEME_ADD_ERROR");
            bot.raven.captureException(e);
        }

    }
};