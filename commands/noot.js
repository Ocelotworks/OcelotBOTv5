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
                if(message.guild.voiceConnection && message.guild.voiceConnection.channel !== message.member.voiceChannel) {
                    message.guild.voiceConnection.disconnect();
                }
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

                fs.readdir("static/noot", function readDir(err, files){
                    if(err){
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                        message.channel.send("An error occurred. Try again later.");
                        connection.disconnect();
                    }else{
                        let noot = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : nootCount++ % files.length;
                        if(!files[noot])
                            return message.channel.send("No such noot.");
                        const file = "static/noot/"+files[noot];
                        message.channel.send(`<:noot:524657747757891615> Noot #${noot} (${files[noot]})\nUse \`${args[0]} ${noot}\` to play this again.`);
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
    },
    test: function(test){
        test('noot no guild', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "This cannot be used in a DM channel.")
                    }
                }
            };
            module.exports.run(message);
        });
        test('noot guild unavailable', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "The guild is unavailable due to discord issues. Try again later.")
                    }
                },
                guild: {
                    available: false
                }
            };
            module.exports.run(message);
        });
        test('noot no voice channel', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "You need to be in a voice channel to use this command.")
                    }
                },
                guild: {
                    available: true
                },
                member: {}
            };
            module.exports.run(message);
        });
        test('noot voice channel full', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "That voice channel is full.")
                    }
                },
                guild: {
                    available: true
                },
                member: {
                    voiceChannel: {
                        full: true
                    }
                }
            };
            module.exports.run(message);
        });
        test('noot voice unjoinable', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "I don't have permission to join the voice channel you're currently in.")
                    }
                },
                guild: {
                    available: true
                },
                member: {
                    voiceChannel: {
                        full: false,
                        joinable: false
                    }
                }
            };
            module.exports.run(message);
        });
        test('noot voice unspeakable', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "I don't have permission to speak in the voice channel you're currently in.")
                    }
                },
                guild: {
                    available: true
                },
                member: {
                    voiceChannel: {
                        full: false,
                        joinable: true,
                        speakable: false
                    }
                }
            };
            module.exports.run(message);
        });
        test('noot', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.fail();
                    }
                },
                guild: {
                    available: true,
                    voiceConnection: {
                        disconnect: function(){
                            t.pass();
                        }
                    }
                },
                member: {
                    voiceChannel: {
                        full: false,
                        joinable: true,
                        speakable: true,
                        name: "Channel",
                        join: function(){
                            t.pass();
                            return {
                                playFile: function(){
                                    t.pass();
                                    return {
                                        on: function(end, callback){
                                            t.is(end, "end");
                                            callback();
                                        }
                                    }
                                },
                                disconnect: function(){
                                    t.pass();
                                }
                            }
                        }
                    }
                }
            };
            const bot = {
                logger: {
                    log: function(message){
                        console.log(message);
                    }
                },
                util: {
                    arrayRand: function(array){
                        return array[0];
                    }
                },
                raven: {
                    captureException: function(){
                        t.fail();
                    }
                }
            };
            module.exports.run(message, null, bot);
        });
    }
};