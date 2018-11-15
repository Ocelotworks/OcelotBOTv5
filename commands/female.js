const faceapp = require('faceapp');
const Discord = require('discord.js');
const request = require('request');
const filter = 'female';
module.exports = {
    name: "Make Female",
    usage: filter+" [URL]",
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["female", "sexchange", "woman"],
    run: async function(message, args, bot){
        const url =  await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            message.channel.stopTyping(true);
            return;
        }
        request({
            encoding: null, url: url
        },async function(err, resp, body){
            if(err){
                message.replyLang("GENERIC_ERROR");
            } else{
                try {
                    message.channel.startTyping();
                    const image = await faceapp.process(body, filter);
                    const attachment = new Discord.Attachment(image, filter+'.png');
                    message.channel.send("", attachment);
                    message.channel.stopTyping();
                }catch(e){
                    bot.raven.captureException(e);
                }finally{
                    message.channel.stopTyping();
                }
            }
        });

    }
};