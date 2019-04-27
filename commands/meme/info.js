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
            return message.channel.send("You must enter a meme to get info on.");


        let meme = (await bot.database.getMemeInfo(args[2].toLowerCase(), message.guild.id))[0];

        if(!meme)
            return message.replyLang("MEME_NOT_FOUND");

        let embed = new Discord.RichEmbed();

        if(meme.meme.startsWith("http"))
            embed.setThumbnail(meme.meme);

        embed.setTitle(`Meme info for '${meme.name}'`);
        embed.addField("Content", meme.meme);
        embed.addField("Added on ", meme.addedon);
        embed.addField("Added By", `<@${meme.addedby}>`);


        message.channel.send(embed);

    }
};
