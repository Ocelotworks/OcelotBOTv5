const request = require('request');
const Discord = require('discord.js');
const gm = require('gm');
const config = require('config').get("Commands.crush");
module.exports = {
    name: "Crush",
    usage: "crush <user or url>",
    rateLimit: 10,
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["crush"],
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
                bot.logger.error(`Error getting picture for !crush: ${err.stack}`);
            }else {
                gm(body)
                    .resize(405)
                    .rotate("black", -4.7)
                    .extent(600, 875, "-128-455")
                    .toBuffer(url.endsWith('gif') ? 'GIF' : 'PNG', async function avatarToBuffer(err, buffer) {
                        if (err) {
                            bot.raven.captureException(err);
                            message.replyLang("CRUSH_ERROR");
                            message.channel.stopTyping(true);
                            bot.logger.error(`Error during avatar format stage of !crush: ${err.stack}`);
                        } else {
                            gm(buffer)
                                .composite(__dirname+"/../"+config.get("template"))
                                .toBuffer(url.endsWith('gif') ? 'GIF' : 'PNG', async function crushToBuffer(err, buffer) {
                                    if (err) {
                                        bot.raven.captureException(err);
                                        message.replyLang("CRUSH_ERROR");
                                        message.channel.stopTyping(true);
                                        bot.logger.error(`Error during composite stage of !crush: ${err.stack}`);
                                    } else {
                                        try {
                                            let attachment = new Discord.Attachment(buffer, `${config.get("filename")}.${url.endsWith('gif') ? 'gif' : 'png'}`);
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


