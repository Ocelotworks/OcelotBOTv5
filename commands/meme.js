/**
 * Created by Peter on 01/07/2017.
 */
const pasync = require('promise-async');
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>>",
    commands: ["meme"],
    run: async function run(message, args, bot) {

        message.channel.send("The meme command is currently undergoing maintenance. Please hang tight.");
        return;

        if(!args[1]){
            message.replyLang("MEME_USAGE");
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




    }
};