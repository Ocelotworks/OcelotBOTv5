/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) removebg
 *  ════╝
 */

const request = require('request');
const Discord = require('discord.js');
const Util = require("../util/Util");
const Sentry = require("@sentry/node");
let deadKeys = [];

module.exports = {
    name: "Remove Background",
    usage: "removebg :image?",
    usageExample: "removebg @Big P",
    detailedHelp: "Tries to remove the background of an image. Works best on real-life photos",
    rateLimit: 100,
    premium: true,
    commands: ["removebg", "rbg", "removebackground"],
    categories: ["image", "tools", "filter"],
    slashCategory: "filter",
    run: async function run(context, bot) {
        const url = await Util.GetImage(bot, context)
        if(!url)
            return context.replyLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        let keys;
        try {
            keys = JSON.parse(context.getSetting("removebg.keys"))
        }catch(e){
            console.log(e);
            return withRembg(url, context,bot);
        }

        if(!keys)
            return withRembg(url, context,bot);

        let key = keys.find((key)=>!deadKeys.includes(key));
        if(!key)
            return withRembg(url, context,bot);

        context.defer();
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
                return context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
            }
            if(body.toString().startsWith("{")){
                try {
                    const data = JSON.parse(body.toString());
                    if (!data.errors) {
                        Sentry.captureMessage("Remove.bg error with no data.errors");
                        return context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
                    }
                    let output = "";
                    for (let i = 0; i < data.errors.length; i++) {
                        if (data.errors[i].title === "Insufficient credits") {
                            deadKeys.push(key);
                            console.log(`Key ${key} is dead.`);
                            return withRembg(url, context, bot);
                            //return message.replyLang("REMOVEBG_QUOTA");
                        }
                        output += data.errors[i].title + "\n"
                    }
                    return context.send({content: output, ephemeral: true});
                }catch(e){
                    Sentry.captureException(e);
                    return context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
                }
            }
            let attachment = new Discord.MessageAttachment(body, "removebg.png");
            return context.send({content: context.getLang("REMOVEBG_ENDORSEMENT"), files:[attachment]});
        })
    }
};

async function withRembg(url, context, bot){
    context.defer();
    request({
        encoding: null,
        method: 'GET',
        url: `https://ob-prod-rembg.d.int.unacc.eu/?url=${encodeURIComponent(url)}`,
    }, async function APIResponse(err, resp, body){
        if(err) {
            bot.logger.log(err);
            bot.logger.log(body);
            Sentry.captureException(err);
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }

        if(body.toString().startsWith("<") || body.toString().startsWith("{")) {
            console.log(body.toString());
            Sentry.captureMessage("bad response from rembg");
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
        let attachment = new Discord.MessageAttachment(body, "removebg.png");
        context.send({files: [attachment]});
    })
}