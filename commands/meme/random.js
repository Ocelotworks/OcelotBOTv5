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
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");

        let meme = (await bot.database.getRandomMeme(message.guild.id))[0];

        if(!meme)
            return message.replyLang("MEME_NOT_FOUND");

        let embed = new Discord.RichEmbed();

        if(meme.meme.startsWith("http"))
            embed.setImage(meme.meme);

        embed.setTitle(`Meme info for '${meme.name}'`);
        embed.addField("Content", meme.meme);
        embed.addField("Added on ", meme.addedon);
        embed.addField("Added By", `<@${meme.addedby}>`);


        message.channel.send(embed);

    }
};
