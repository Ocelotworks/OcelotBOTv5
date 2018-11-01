const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
    name: "Doot Doot",
    usage: "doot",
    rateLimit: 50,
    categories: ["memes", "fun", "voice"],
    requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["doot", "toot"],
    run:  async function run(message, args, bot){
        if(!message.guild){
            message.channel.send("This cannot be used in a DM channel.");
        }else if(!message.guild.available){
            message.channel.send("The guild is unavailable due to discord issues. Try agian later.");
        }else if(!message.member.voiceChannel) {
            message.channel.send("You need to be in a voice channel to use this command.");
        }else if(message.member.voiceChannel.full){
            message.channel.send("That voice channel is full.");
        }else if(!message.member.voiceChannel.joinable) {
            message.channel.send("I don't have permission to join the voice channel you're currently in.");
        }else if(!message.member.voiceChannel.speakable){
            message.channel.send("I don't have permission to speak in the voice channel you're currently in.");
        }else{
            try {
                if(message.guild.voiceConnection) {
                    message.guild.voiceConnection.disconnect();
                }
                bot.logger.log("Joining voice channel "+message.member.voiceChannel.name);
                let connection = await message.member.voiceChannel.join();
                fs.readdir("static/doot", function readDir(err, files){
                    if(err){
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                        message.channel.send("An error occurred. Try again later.");
                        connection.disconnect();
                    }else{
                        const file = "static/doot/"+bot.util.arrayRand(files);
                        bot.logger.log("Playing "+file);
                        try {
                            const dispatcher = connection.playFile(file);
                            dispatcher.on("end", function fileEnd(){
                                bot.logger.log("Finished playing");
                                connection.disconnect();
                            })
                        }catch(e){
                            bot.logger.log(e);
                            bot.raven.captureException(e);
                            bot.channel.send("An error occurred. Try again later.");
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