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
    rateLimit: 10,
    commands: ["removebg", "rbg", "removebackground"],
    categories: ["image", "tools"],
    run: async function run(message, args, bot) {
        message.channel.startTyping();
        const url =  await bot.util.getImage(message, args);
        if(!url) {
            message.channel.stopTyping(true);
            return message.channel.send(":warning: No image found.");
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
                                output += `:warning: Quota has been reached for this month.\nThis command costs me money to have, if you'd like to donate to help increase the quota, join the support server with ${message.getSetting("prefix")}support\n`
                            }
                            output += data.errors[i].title+"\n"
                        }
                        message.channel.send(output);
                    }else{
                        message.replyLang("GENERIC_ERROR");
                    }time
                }catch(e){
                    bot.raven.captureException(e);
                    message.channel.send("Got a malformed response. Try again later.")
                }
                message.channel.stopTyping(true);
            }else{
                let attachment = new Discord.Attachment(body, "removebg.png");
                message.channel.send("_Background removal provided by remove.bg_",attachment);
                message.channel.stopTyping(true);
            }
        })


    }
};