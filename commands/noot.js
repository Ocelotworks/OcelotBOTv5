const Discord = require('discord.js');
const fs = require('fs');
let nootCount = 0;
module.exports = {
    name: "Noot Noot",
    usage: "noot",
    rateLimit: 50,
    categories: ["memes", "voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["noot", "pingu"],
    unwholesome: true,
    run: async function run(message, args, bot) {
        if (!message.guild) {
            message.replyLang("GENERIC_DM_CHANNEL");
        } else if (!message.guild.available) {
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        } else if (!message.member.voice.channel) {
            message.replyLang("VOICE_NO_CHANNEL");
        } else if (message.member.voice.channel.full) {
            message.replyLang("VOICE_FULL_CHANNEL");
        } else if (!message.member.voice.channel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        } else if (!message.member.voice.channel.speakable) {
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        } else if (await bot.database.hasActiveSession(message.guild.id)) {
            message.channel.send(`The bot is currently playing music. Please wait for the queue or type ${message.getSetting("prefix")}music stop to end to start nooting`);
        } else {
            try {
                bot.logger.log("Joining voice channel " + message.member.voice.channel.name);

                fs.readdir(__dirname + "/../static/noot", function readDir(err, files) {
                    if (err) {
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                        message.channel.send("An error occurred. Try again later.");

                    } else {
                        let noot = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : nootCount++ % files.length;
                        if (!files[noot])
                            return message.channel.send("No such noot.");
                        const file = "/home/peter/stevie5/static/noot/" + files[noot];
                        message.channel.send(`<:noot:524657747757891615> Noot #${noot} (${files[noot]})\nUse \`${args[0]} ${noot}\` to play this again.`);
                        bot.logger.log("Playing " + file);
                        bot.lavaqueue.playOneSong(message.member.voice.channel, file);
                    }
                })
            } catch (e) {
                bot.raven.captureException(e);
                bot.logger.log(e);
            }
        }
    }
};