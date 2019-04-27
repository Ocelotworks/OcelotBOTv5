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
        if(!message.guild.id)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(message.getSetting("meme.disallowAdding"))
           return message.channel.send("Adding memes is disabled.");
        if(message.getSetting("meme.disallowUserAdding") && message.getSetting("meme.disallowUserAdding").indexOf(message.author.id) > -1)
            return message.channel.send("You are not allowed to add memes.");

        try {
            if (!args[3])
                return message.replyLang("MEME_ENTER_URL");
            if(message.mentions.users.size > 0 || message.mentions.roles.size > 0 || message.content.indexOf("@everyone") > -1 && message.getSetting("meme.disallowTags"))
                return message.channel.send("You're not allowed to tag people or roles in memes.");

            const newMemeName = args[2].toLowerCase();
            if (newMemeName.startsWith("http"))
                return message.replyLang("MEME_ENTER_URL");

            const memeCheckResult = await bot.database.getMeme(newMemeName, message.guild.id);
            if (memeCheckResult[0] && memeCheckResult[0].server !== "global")
                return message.replyLang("MEME_ADD_EXISTS");

            await bot.database.addMeme(message.author.id, message.guild.id, newMemeName, message.content.substring(args[0].length + args[1].length + args[2].length + 3));
            message.replyLang("MEME_ADD_SUCCESS");
        } catch (e) {
            message.replyLang("MEME_ADD_ERROR");
            bot.raven.captureException(e);
        }

    }
};