/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) info
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Meme Info",
    usage: "info <name>",
    commands: ["info"],
    run: async function (message, args, bot) {
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!args[2])
            return message.replyLang("MEME_INFO_HELP");

        let meme = (await bot.database.getMemeInfo(args[2].toLowerCase(), message.guild.id))[0];

        if(!meme)
            return message.replyLang("MEME_NOT_FOUND");

        let embed = new Discord.MessageEmbed();

        if(meme.meme.startsWith("http"))
            embed.setThumbnail(meme.meme);

        embed.setTitle(await message.getLang("MEME_INFO_HEADER", {name: meme.name}));
        embed.addField(await message.getLang("MEME_INFO_CONTENT"), meme.meme);
        embed.addField(await message.getLang("MEME_INFO_ADDED_ON"), meme.addedon);
        embed.addField(await message.getLang("MEME_INFO_ADDED_BY"), `<@${meme.addedby}>`);


        message.channel.send(embed);
    }
};
