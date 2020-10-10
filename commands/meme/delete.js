/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) delete
 *  ════╝
 */
module.exports = {
    name: "Delete Meme",
    usage: "delete <name>",
    commands: ["delete", "remove"],
    run: async function (message, args, bot) {
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!args[2])
            return message.replyLang("MEME_REMOVE_HELP");


        let meme = await bot.database.getMemeInfo(args[2].toLowerCase(), message.guild.id);

        if(!meme[0])
            return message.replyLang("MEME_NOT_FOUND");

        if(meme[0].addedby !== message.author.id && !message.member.hasPermission("MANAGE_MESSAGES"))
            return message.replyLang("MESSAGE_REMOVE_INVALID_MEME");

        try {
            await bot.database.removeMeme(args[2].toLowerCase(), message.guild.id);
            message.replyLang("MEME_REMOVE_SUCCESS");
        }catch(e){
            message.replyLang("MESSAGE_REMOVE_ERROR");
        }

    }
};