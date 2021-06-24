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
    run: async function (context, bot) {
        if (!context.guild)
            return context.sendLang("GENERIC_DM_CHANNEL");

        let meme = (await bot.database.getRandomMeme(context.guild.id))[0];

        if (!meme)
            return context.sendLang("MEME_NOT_FOUND");

        let embed = new Discord.MessageEmbed();

        if (meme.meme.startsWith("http"))
            embed.setImage(meme.meme);

        embed.setTitle(await message.getLang("MEME_INFO_HEADER", {meme: meme.name}));
        embed.addField(await message.getLang("MEME_INFO_CONTENT"), meme.meme);
        embed.addField(await message.getLang("MEME_INFO_ADDED_ON"), meme.addedon);
        embed.addField(await message.getLang("MEME_INFO_ADDED_BY"), `<@${meme.addedby}>`);

        return context.send({embeds: [embed]});

    }
};
