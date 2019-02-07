/**
 * Created by Peter on 01/07/2017.
 */
const pasync = require('promise-async');
const columnify = require('columnify');
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>>",
    commands: ["meme"],
    categories: ["fun", "memes"],
    run: async function run(message, args, bot) {
        if(!args[1]){
            //message.replyLang("MEME_USAGE");
            message.channel.send("Invalid usage: !"+module.exports.usage);
            return;
        }

        const guildID = message.guild ? message.guild.id : "322032568558026753";

        const arg = args[1].toLowerCase();

        if(arg === "list" || arg === "search"){

            let memes;
            if(arg === "search"){
                if(!args[2])
                    return message.channel.send(":warning: You must enter a search term.");
                memes = await bot.database.searchMeme(args[2], message.guild ? message.guild.id : "global");
            }else{
                memes = await bot.database.getMemes(message.guild ? message.guild.id : "global");
            }

            let pages = memes.chunk(30);//parseInt(message.getSetting("meme.pageSize")));

            const availableMemes = await bot.lang.getTranslation(guildID, "MEME_AVAILABLE_MEMES");
            const availableGlobalMemes = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "MEME_GLOBAL_MEMES");
            const memeServer = message.guild ? await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "MEME_SERVER", {serverName: message.guild.name}) : "You should never see this.";

            let index = 0;
            let sentMessage;

            let buildPage = async function () {
                const page = pages[index];

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

                if(sentMessage)
                    await sentMessage.edit(output);
                else
                    sentMessage = await message.channel.send(output);

            };

            await buildPage();

            if(pages.length === 1)
                return;

            (async function () {
                await sentMessage.react("⏮");
                await sentMessage.react("◀");
                await sentMessage.react("▶");
                await sentMessage.react("⏭");
            })();

            await sentMessage.awaitReactions(async function (reaction, user) {
                if (user.id === bot.client.user.id) return false;
                switch (reaction.emoji.name) {
                    case "⏮":
                        index = 0;
                        await buildPage();
                        break;
                    case "◀":
                        if (index > 0)
                            index--;
                        else
                            index = pages.length - 1;
                        await buildPage();
                        break;
                    case "▶":
                        if (index < pages.length - 1)
                            index++;
                        else
                            index = 0;
                        await buildPage();
                        break;
                    case "⏭":
                        index = pages.length - 1;
                        await buildPage();
                        break;
                }
                reaction.remove(user);

            }, {time: message.getSetting("meme.pageTimeout")});
            sentMessage.clearReactions();
            return;
        }else if(arg === "add"){
            if(message.getSetting("meme.disallowAdding")) {
                message.channel.send("Adding memes is disabled.");
            }else if(message.getSetting("meme.disallowUserAdding") && message.getSetting("meme.disallowUserAdding").indexOf(message.author.id) > -1){
                message.channel.send("You are not allowed to add memes.");
            }else if(!message.guild.id){
                message.channel.send("You can't use this in a DM channel.");
            }else {
                try {
                    if (!args[3]) {
                        message.replyLang("MEME_ENTER_URL");
                        return;
                    }

                    if(message.mentions.users.size > 0 || message.mentions.roles.size > 0 || message.content.indexOf("@everyone") > -1 && message.getSetting("meme.disallowTags")){
                        message.channel.send("You're not allowed to tag people or roles in memes.");
                        return;
                    }


                    const newMemeName = args[2].toLowerCase();

                    if (newMemeName.startsWith("http")) {
                        message.replyLang("MEME_ENTER_URL");
                        return;
                    }

                    const memeCheckResult = await bot.database.getMeme(newMemeName, message.guild.id);
                    if (memeCheckResult[0] && memeCheckResult[0].server !== "global") {
                        message.replyLang("MEME_ADD_EXISTS");
                        return;
                    }

                    await bot.database.addMeme(message.author.id, message.guild.id, newMemeName, message.content.substring(args[0].length + args[1].length + args[2].length + 3));
                    message.replyLang("MEME_ADD_SUCCESS");
                } catch (e) {
                    message.replyLang("MEME_ADD_ERROR");
                    bot.raven.captureException(e);
                }
            }
            return;
        }

        try {
            const memeResult = await bot.database.getMeme(arg, message.guild ? message.guild.id : "global");

            if (memeResult[0]) {
                message.channel.send(memeResult[0].meme);
            } else {
                message.replyLang("MEME_NOT_FOUND");
            }
        }catch(e){
            message.replyLang("MEME_ERROR");
            bot.raven.captureException(e);
        }
    }
};