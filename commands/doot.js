const Discord = require('discord.js');
const fs = require('fs');
let dootCount = 0;
module.exports = {
    name: "Doot Doot",
    usage: "doot",
    rateLimit: 50,
    categories: ["memes", "voice"],
    detailedHelp: "Doot Doot",
    requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["doot", "toot"],
    run:  async function run(message, args, bot){
        if(args[1] && args[1].toLowerCase() === "stop"){
            message.channel.send("https://i.imgur.com/QA8anth.jpg");
        }else if(!message.guild){
            message.replyLang("GENERIC_DM_CHANNEL");
        }else if(!message.guild.available){
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        }else if(!message.member.voice.channel) {
            message.replyLang("VOICE_NO_CHANNEL");
        }else if(message.member.voice.channel.full){
            message.replyLang("VOICE_FULL_CHANNEL");
        }else if(!message.member.voice.channel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        }else if(!message.member.voice.channel.speakable){
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        }else if(await bot.database.hasActiveSession(message.guild.id)){
            message.channel.send("The bot is currently playing music. Please wait for the queue to end to start guessing");
        }else{
            try {
                bot.logger.log("Joining voice channel "+message.member.voice.channel.name);


                fs.readdir(__dirname+"/../static/doot", function readDir(err, files){
                    if(err){
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                        message.replyLang("GENERIC_ERROR");
                    }else{
                        let doot = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : dootCount++ % files.length;
                        if(!files[doot])
                            return message.replyLang("DOOT_NOT_FOUND");
                        const file = "/home/peter/stevie5/static/doot/"+files[doot];
                        bot.logger.log("Playing "+file);
                        message.replyLang("DOOT", {doot, arg: args[0], fileName: files[doot]});
                        bot.lavaqueue.playOneSong(message.member.voice.channel, file);

                    }
                })
            }catch(e){
                //bot.raven.captureException(e);
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }
        }
    }
};