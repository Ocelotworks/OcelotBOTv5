/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) removebg
 *  ════╝
 */

const config = require('config');
const request = require('request');
const Discord = require('discord.js');
let deadKeys = [];

module.exports = {
    name: "Remove Background",
    usage: "removebg [URL]",
    usageExample: "removebg @Big P",
    detailedHelp: "Tries to remove the background of an image. Works best on real-life photos",
    rateLimit: 100,
    premium: true,
    commands: ["removebg", "rbg", "removebackground"],
    categories: ["image", "tools", "filter"],
    run: async function run(message, args, bot) {
        let keys;
        try {
            keys = JSON.parse(message.getSetting("removebg.keys"))
        }catch(e){
            console.log(e);
            return withRembg(message,args,bot);
        }
        if(!keys){
            return withRembg(message,args,bot);
        }
        let key = keys.find((key)=>!deadKeys.includes(key));
        if(!key){
            return withRembg(message,args,bot);
        }

        message.channel.startTyping();
        const url =  await bot.util.getImage(message, args);
        if(!url) {
            message.channel.stopTyping(true);
            return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
        }
        bot.tasks.startTask("removebg", message.id);
        request({
            encoding: null,
            method: 'POST',
            url: "https://api.remove.bg/v1.0/removebg",
            headers: {
                "X-Api-Key": key,
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
                                deadKeys.push(key);
                                console.log(`Key ${key} is dead.`);
                                bot.tasks.endTask("removebg", message.id);
                                message.channel.stopTyping(true);
                                return withRembg(message,args,bot);
                                //return message.replyLang("REMOVEBG_QUOTA");
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
                bot.tasks.endTask("removebg", message.id);
                message.channel.stopTyping(true);
            }else{
                let attachment = new Discord.MessageAttachment(body, "removebg.png");
                message.channel.send({content: await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "REMOVEBG_ENDORSEMENT"), files:[attachment]});
                message.channel.stopTyping(true);
                bot.tasks.endTask("removebg", message.id);
            }
        })
    }
};

async function withRembg(message, args, bot){
    message.channel.startTyping();
    const url =  await bot.util.getImage(message, args);
    if(!url) {
        message.channel.stopTyping(true);
        return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
    }
    bot.tasks.startTask("removebg", message.id);
    request({
        encoding: null,
        method: 'GET',
        url: `https://rbg1.bint.cc/?url=${encodeURIComponent(url)}`,
    }, async function APIResponse(err, resp, body){
        if(body.toString().startsWith("<") || body.toString().startsWith("{")) {
            console.log(body.toString());
            message.channel.stopTyping(true);
            return message.replyLang("GENERIC_ERROR");
        }
        let attachment = new Discord.MessageAttachment(body, "removebg.png");
        message.channel.send({files: [attachment]});
        message.channel.stopTyping(true);
        bot.tasks.endTask("removebg", message.id);
    })

}