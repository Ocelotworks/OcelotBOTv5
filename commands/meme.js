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


        const arg = args[1].toLowerCase();

        if(arg === "list"){

            const memes = await bot.database.getMemes(message.guild ? message.guild.id : "global");

            let globalMemes = "";
            let serverMemes = "";

            await pasync.eachSeries(memes, function(meme, cb){
                if(meme.server === "global"){
                    globalMemes += meme.name + " ";
                }else{
                    serverMemes += meme.name + " ";
                }
                cb();
            });

            let output;

            if(message.guild){
                output = `**${await bot.lang.getTranslation(message.guild.id, "MEME_AVAILABLE_MEMES")}**\n__:earth_americas: **${await bot.lang.getTranslation(message.guild.id, "MEME_GLOBAL_MEMES")}**__ ${globalMemes}\n__:house_with_garden:${await bot.lang.getTranslation(message.guild.id, "MEME_SERVER", {serverName: message.guild.name})}__ ${serverMemes === "" ? "No memes yet. Add them with !meme add" : serverMemes}`;
            }else{
                output = `**${await bot.lang.getTranslation(message.guild.id, "MEME_AVAILABLE_MEMES")}**\n__:earth_americas: **${await bot.lang.getTranslation(message.guild.id, "MEME_GLOBAL_MEMES")}**__ ${globalMemes}`;
            }

            if(output.length >= 2000){
                message.channel.send(output.substring(0, 2000));
                message.channel.send(output.substring(2000));
            }else{
                message.channel.send(output);
            }
            return;
        }

        if(arg === "add"){
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
            }catch(e){
                message.replyLang("MEME_ADD_ERROR");
                bot.raven.captureException(e);
            }
            return;
        }
        try {
            const memeResult = await bot.database.getMeme(arg, message.guild.id);

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