/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/04/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const columnify = require('columnify');
const Util = require("../../util/Util");
module.exports = {
    name: "List/Search Memes",
    usage: "list :search?+", // TODO: autocomplete
    commands: ["list", "search"],
    run: async function (context, bot) {
        let memes;
        if (context.options.search) {
            memes = await bot.database.searchMeme(context.options.search, context.guild?.id || "global");
            if (memes.length === 0)
                return context.send(`:warning: No results. To view all memes just do ${context.command} ${context.options.command}`);
        } else {
            memes = await bot.database.getMemes(context.guild?.id || "global");
        }

        let pages = memes.chunk(30);//parseInt(message.getSetting("meme.pageSize")));

        const availableMemes = context.getLang("MEME_AVAILABLE_MEMES");
        const availableGlobalMemes = context.getLang("MEME_GLOBAL_MEMES");
        const memeServer = context.guild ? context.getLang("MEME_SERVER", {serverName: context.guild.name}) : "You should never see this.";

        if (pages == null || pages.length === 0) {
            return context.send("No memes yet. Add them with !meme add");
        }

        return Util.StandardPagination(bot, context, pages, async function (page, index) {
            //If you can't stand the heat get out of the kitchen
            let globalColumns = [[], [], [], [], []];
            let serverColumns = [[], [], [], [], []];
            let globalCounter = 0;
            let serverCounter = 0;

            for (let i = 0; i < page.length; i++) {
                const meme = page[i];
                if (meme.server === "global")
                    globalColumns[globalCounter++ % globalColumns.length].push(meme.name);
                else
                    serverColumns[serverCounter++ % serverColumns.length].push(meme.name);
            }

            const config = {showHeaders: false};
            let globalMemes = columnify(globalColumns, config);
            let serverMemes = columnify(serverColumns, config);

            let output;

            output = `Page ${index + 1}/${pages.length}\n**${availableMemes}**\n__:earth_americas: **${availableGlobalMemes}**__ \n\`\`\`\n${globalMemes === "" ? "No global memes found." : globalMemes}\n\`\`\``;
            if (context.guild)
                output += `\n__:house_with_garden:${memeServer}__\n\`\`\`\n${serverMemes === "" ? "No memes yet. Add them with !meme add <name> <url>" : serverMemes}\n\`\`\``;
            return {content: output};
        }, true);
    }
};