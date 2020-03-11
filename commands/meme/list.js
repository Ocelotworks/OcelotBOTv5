/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "List/Search Memes",
    usage: "list [search term]",
    commands: ["list", "search"],
    run: async function(message, args, bot){
        const arg = args[1].toLowerCase();
        let memes;
        if(args[2]){
            memes = await bot.database.searchMeme(args[2], message.guild ? message.guild.id : "global");
            if(memes.length === 0)
                return message.channel.send(`:warning: No results. To view all memes just do ${args[0]} ${args[1]}`);
        }else{
            memes = await bot.database.getMemes(message.guild ? message.guild.id : "global");
        }

        let pages = memes.chunk(30);//parseInt(message.getSetting("meme.pageSize")));

        const availableMemes = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "MEME_AVAILABLE_MEMES");
        const availableGlobalMemes = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "MEME_GLOBAL_MEMES");
        const memeServer = message.guild ? await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "MEME_SERVER", {serverName: message.guild.name}) : "You should never see this.";

        if(pages == null){
            return message.channel.send("No memes yet. Add them with !meme add");
        }

        bot.util.standardPagination(message.channel, pages, async function(page, index){
            //If you can't stand the heat get out of the kitchen
            let globalColumns = [[],[],[],[],[]];
            let serverColumns = [[],[],[],[],[]];
            let globalCounter = 0;
            let serverCounter = 0;

            for(let i = 0; i < page.length; i++){
                const meme = page[i];
                if(meme.server === "global")
                    globalColumns[globalCounter++ % globalColumns.length].push(meme.name);
                else
                    serverColumns[serverCounter++ % serverColumns.length].push(meme.name);
            }

            const config = {showHeaders: false};
            let globalMemes = columnify(globalColumns, config);
            let serverMemes = columnify(serverColumns, config);

            let output;

            output = `Page ${index+1}/${pages.length}\n**${availableMemes}**\n__:earth_americas: **${availableGlobalMemes}**__ \n\`\`\`\n${globalMemes === "" ? "No global memes found." : globalMemes}\n\`\`\``;
            if(message.guild)
                output += `\n__:house_with_garden:${memeServer}__\n\`\`\`\n${serverMemes === "" ? "No memes yet. Add them with !meme add" : serverMemes}\n\`\`\``;
            return output;
        }, true, message.getSetting("meme.pageTimeout"));
    }
};