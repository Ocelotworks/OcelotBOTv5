const request = require('request');
const Discord = require('discord.js');
const gm = require('gm');
const config = require('config').get("Commands.dictator");
module.exports = {
    name: "Dictator Meme",
    usage: "dictator <user or url>",
    rateLimit: 10,
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["dictator", "chairman", "mao"],
    run: async function run(message, args, bot){
        message.channel.startTyping();
        const url = await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            message.channel.stopTyping(true);
            return;
        }
        request({encoding: null, url: url}, function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                message.replyLang("CRUSH_ERROR");
                message.channel.stopTyping(true);
                bot.logger.error(`Error getting picture for !dictator: ${err.stack}`);
            }else {
                gm(body)
                    .resize(144)
                    .rotate("white", 0.5)
                    .extent(598, 465, "-229-125")
                    .toBuffer('PNG', async function avatarToBuffer(err, buffer) {
                        if (err) {
                            bot.raven.captureException(err);
                            message.replyLang("CRUSH_ERROR");
                            message.channel.stopTyping(true);
                            bot.logger.error(`Error during avatar format stage of !dictator: ${err.stack}`);
                        } else {
                            gm(buffer)
                                .composite(__dirname+"/../"+config.get("template"))
                                .toBuffer('PNG', async function crushToBuffer(err, buffer) {
                                    if (err) {
                                        bot.raven.captureException(err);
                                        message.replyLang("CRUSH_ERROR");
                                        message.channel.stopTyping(true);
                                        bot.logger.error(`Error during composite stage of !dictator: ${err.stack}`);
                                    } else {
                                        try {
                                            let attachment = new Discord.Attachment(buffer, config.get("filename"));
                                            message.channel.send("", attachment);
                                            message.channel.stopTyping(true);
                                        } catch (e) {
                                            bot.raven.captureException(e);
                                            bot.logger.error("Error uploading crush file");
                                            message.channel.stopTyping(true);
                                            message.replyLang("GENERIC_ERROR");
                                            console.log(e);
                                        }
                                    }
                                });
                        }
                    });
            }
            message.channel.stopTyping(true);
        });
    }
};


