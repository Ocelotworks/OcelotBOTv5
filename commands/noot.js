const Discord = require('discord.js');
const fs = require('fs');
let nootCount = 0;
module.exports = {
    name: "Noot Noot",
    usage: "noot",
    rateLimit: 50,
    categories: ["memes", "voice"],
    requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["noot", "pingu"],
    run:  async function run(message, args, bot){
        if(!message.guild){
            message.replyLang("GENERIC_DM_CHANNEL");
        }else if(!message.guild.available){
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        }else if(!message.member.voiceChannel) {
            message.replyLang("VOICE_NO_CHANNEL");
        }else if(message.member.voiceChannel.full){
            message.replyLang("VOICE_FULL_CHANNEL");
        }else if(!message.member.voiceChannel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        }else if(!message.member.voiceChannel.speakable){
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        }else{
            try {
                if(message.guild.voiceConnection && message.guild.voiceConnection.channel.id !== message.member.voiceChannel.id && !bot.voiceLeaveTimeouts[message.member.voiceChannel.id])
                    await message.guild.voiceConnection.disconnect();

                if(bot.voiceLeaveTimeouts[message.member.voiceChannel.id])
                    clearTimeout(bot.voiceLeaveTimeouts[message.member.voiceChannel.id]);

                bot.logger.log("Joining voice channel "+message.member.voiceChannel.name);
                let connection = await message.member.voiceChannel.join();

                connection.on('error', function(err){
                    bot.logger.log(err);
                    message.replyLang("GENERIC_ERROR");
                });

                connection.on('failed', function(err){
                    bot.logger.log(err);
                    message.replyLang("GENERIC_ERROR");
                });

                fs.readdir(__dirname+"/../static/noot", function readDir(err, files){
                    if(err){
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                        message.channel.send("An error occurred. Try again later.");
                        connection.disconnect();
                    }else{
                        let noot = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : nootCount++ % files.length;
                        if(!files[noot])
                            return message.channel.send("No such noot.");
                        const file = __dirname+"/../static/noot/"+files[noot];
                        message.channel.send(`<:noot:524657747757891615> Noot #${noot} (${files[noot]})\nUse \`${args[0]} ${noot}\` to play this again.`);
                        bot.logger.log("Playing "+file);
                        try {
                            const dispatcher = connection.playFile(file);
                            dispatcher.on("end", function fileEnd(){
                                bot.logger.log("Finished playing");
                                if(bot.voiceLeaveTimeouts[connection.channel.id])
                                    clearTimeout(bot.voiceLeaveTimeouts[connection.channel.id]);
                                bot.voiceLeaveTimeouts[connection.channel.id] = setTimeout(function leaveTimeout(){
                                    if(connection) {
                                        bot.logger.log(`Leaving voice channel ${connection.channel.name} (${connection.channel.id})`);
                                        connection.disconnect();
                                    }
                                    delete bot.voiceLeaveTimeouts[connection.channel.id];
                                }, parseInt(message.getSetting("songguess.leaveTimeout")));
                            })
                        }catch(e){
                            bot.logger.log(e);
                            bot.raven.captureException(e);
                            message.replyLang("GENERIC_ERROR");
                            connection.disconnect();
                        }
                    }
                })
            }catch(e){
                bot.raven.captureException(e);
                bot.logger.log(e);
            }
        }
    }
};