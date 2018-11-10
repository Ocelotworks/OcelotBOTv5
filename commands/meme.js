/**
 * Created by Peter on 01/07/2017.
 */
const pasync = require('promise-async');
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>>",
    commands: ["meme"],
    categories: ["fun", "memes"],
    run: async function run(message, args, bot) {
        if(message.guild.id === "318432654880014347" && message.channel.id !== "318432654880014347")return;
        if(!args[1]){
            //message.replyLang("MEME_USAGE");
            message.channel.send("Invalid usage: !"+module.exports.usage);
            return;
        }

        const guildID = message.guild ? message.guild.id : "322032568558026753";

        const arg = args[1].toLowerCase();

        if(arg === "list"){

            const memes = await bot.database.getMemes(message.guild ? message.guild.id : "global");
            let pages = memes.chunk(50);




            const availableMemes = await bot.lang.getTranslation(guildID, "MEME_AVAILABLE_MEMES");
            const availableGlobalMemes = await bot.lang.getTranslation(message.guild.id, "MEME_GLOBAL_MEMES");
            const memeServer = message.guild ? await bot.lang.getTranslation(message.guild.id, "MEME_SERVER", {serverName: message.guild.name}) : "You should never see this.";


            let index = 0;
            let sentMessage;

            let buildPage = async function () {
                const page = pages[index];
                let globalMemes = "";
                let serverMemes = "";
                await pasync.eachSeries(page, function(meme, cb){
                    if(meme.server === "global"){
                        globalMemes += meme.name + " ";
                    }else{
                        serverMemes += meme.name + " ";
                    }
                    cb();
                });

                let output;

                if(message.guild){
                    output = `**${availableMemes}**\n__:earth_americas: **${availableGlobalMemes}**__ ${globalMemes}\n__:house_with_garden:${memeServer}__ ${serverMemes === "" ? "No memes yet. Add them with !meme add" : serverMemes}`;
                }else{
                    output = `**${availableMemes}**\n__:earth_americas: **${availableGlobalMemes}**__ ${globalMemes}`;
                }

                if(sentMessage) {
                    await sentMessage.edit(`Page ${index + 1}/${pages.length}\n${output}`);
                }else{
                    sentMessage = await message.channel.send(`Page ${index + 1}/${pages.length}\n${output}`);
                }
            };

            if(pages.length === 1){
                await buildPage();
                return;
            }

            await buildPage();
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

            }, {time: 60000});
            sentMessage.clearReactions();
            return;
        }else if(arg === "add"){
            if(!message.guild.id){
                message.channel.send("You can't use this in a DM channel.");
            }else {
                try {
                    if (!args[3]) {
                        message.replyLang("MEME_ENTER_URL");
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