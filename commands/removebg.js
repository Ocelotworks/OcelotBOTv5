/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) removebg
 *  ════╝
 */

const config = require('config');
const request = require('request');
const Discord = require('discord.js');

module.exports = {
    name: "Remove Background",
    usage: "removebg [URL]",
    rateLimit: 100,
    premium: true,
    commands: ["removebg", "rbg", "removebackground"],
    categories: ["image", "tools"],
    run: async function run(message, args, bot) {
        message.channel.startTyping();
        const url =  await bot.util.getImage(message, args);
        if(!url) {
            message.channel.stopTyping(true);
            return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
        }
        console.log(url);
        request({
            encoding: null,
            method: 'POST',
            url: "https://api.remove.bg/v1.0/removebg",
            headers: {
                "X-Api-Key": config.get("Commands.removebg.key")
            },
            form: {
                image_url: url
            }
        }, async function APIResponse(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                message.replyLang("GENERIC_ERROR");
            }else if(body.toString().startsWith("{")){
                try {
                    const data = JSON.parse(body.toString());
                    if(data.errors){
                        let output = "";
                        for(let i = 0; i < data.errors.length; i++){
                            if(data.errors[i].title === "Insufficient credits"){
                                return message.replyLang("REMOVEBG_QUOTA");
                            }
                            output += data.errors[i].title+"\n"
                        }
                        message.channel.send(output);
                    }else{
                        message.replyLang("GENERIC_ERROR");
                    }
                }catch(e){
                    bot.raven.captureException(e);
                    message.replyLang("GENERIC_ERROR");
                }
                message.channel.stopTyping(true);
            }else{
                let attachment = new Discord.Attachment(body, "removebg.png");
                message.channel.send(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "REMOVEBG_ENDORSEMENT"),attachment);
                message.channel.stopTyping(true);
            }
        })


    }
};