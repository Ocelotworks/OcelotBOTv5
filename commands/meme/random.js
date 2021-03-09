/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/05/2019
 * ╚════ ║   (ocelotbotv5) random
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Random Meme",
    usage: "random",
    commands: ["random", "rand"],
    run: async function (message, args, bot) {
        if (!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");

        let meme = (await bot.database.getRandomMeme(message.guild.id))[0];

        if (!meme)
            return message.replyLang("MEME_NOT_FOUND");

        let embed = new Discord.MessageEmbed();

        if (meme.meme.startsWith("http"))
            embed.setImage(meme.meme);

        embed.setTitle(await message.getLang("MEME_INFO_HEADER", {meme: meme.name}));
        embed.addField(await message.getLang("MEME_INFO_CONTENT"), meme.meme);
        embed.addField(await message.getLang("MEME_INFO_ADDED_ON"), meme.addedon);
        embed.addField(await message.getLang("MEME_INFO_ADDED_BY"), `<@${meme.addedby}>`);

        message.channel.send(embed);

    }
};
