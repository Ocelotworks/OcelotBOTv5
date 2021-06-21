/**
 * Created by Peter on 13/07/2017.
 */

const config = require('config');
const request = require('request');
const Image = require('../util/Image');
const Util = require("../util/Util");

module.exports = {
    name: "Identify Image",
    usage: "identify :image?",
    rateLimit: 50,
    detailedHelp: "Tries to identify an image",
    usageExample: "identify @Big P",
    responseExample: "🤔 That looks like a great developer.",
    commands: ["identify", "ident"],
    categories: ["tools", "image"],
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});


        request({
            method: 'POST',
            json: true,
            url: "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&details=Celebrities&language=en",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("API.msVision.key")
            },
            body: {
                url: url
            }
        }, async function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
            }else if(body && body.description && body.description.captions && body.description.captions.length > 0) {
                if(url.indexOf("SPOILER_") > -1){
                    context.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: `||${body.description.captions[0].text}||`});
                }else{
                    context.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: body.description.captions[0].text});
                }
            }else{
                context.replyLang({content: "IDENTIFY_UNKNOWN", ephemeral: true});
            }
        })


    }
};