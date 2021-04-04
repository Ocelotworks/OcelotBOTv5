/**
 * Created by Peter on 13/07/2017.
 */

const config = require('config');
const request = require('request');


module.exports = {
    name: "Identify Image",
    usage: "identify [URL]",
    rateLimit: 50,
    detailedHelp: "Tries to identify an image",
    usageExample: "identify @Big P",
    responseExample: "🤔 That looks like a great developer.",
    commands: ["identify", "ident"],
    categories: ["tools", "image"],
    run: async function run(message, args, bot) {
        const url =  await bot.util.getImage(message, args);

        if(url === "https://cdn.discordapp.com/emojis/726576223081463939.png?v=1"){
            return  message.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: "the man who touched me as a child"});
        }

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
                message.replyLang("GENERIC_ERROR");
            }else if(body && body.description && body.description.captions && body.description.captions.length > 0) {
                if(url.indexOf("SPOILER_") > -1){
                    message.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: `||${body.description.captions[0].text}||`});
                }else{
                    message.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: body.description.captions[0].text});
                }
            }else{
                message.replyLang("IDENTIFY_UNKNOWN");
            }
        })


    }
};