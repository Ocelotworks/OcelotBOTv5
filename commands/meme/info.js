/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) info
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Meme Info",
    usage: "info :name+",
    commands: ["info"],
    run: async function (context, bot) {
        if (!context.guild)
            return context.sendLang("GENERIC_DM_CHANNEL");

        let meme = (await bot.database.getMemeInfo(context.options.name, context.guild.id))[0];

        if (!meme)
            return context.sendLang("MEME_NOT_FOUND");

        let embed = new Discord.MessageEmbed();

        if (meme.meme.startsWith("http"))
            embed.setThumbnail(meme.meme);

        embed.setTitle(context.getLang("MEME_INFO_HEADER", {meme: meme.name}));
        embed.addField(context.getLang("MEME_INFO_CONTENT"), meme.meme);
        embed.addField(context.getLang("MEME_INFO_ADDED_ON"), meme.addedon);
        embed.addField(context.getLang("MEME_INFO_ADDED_BY"), `<@${meme.addedby}>`);

        return context.send({embeds: [embed]});
    }
};
