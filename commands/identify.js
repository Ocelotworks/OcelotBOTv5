/**
 * Created by Peter on 13/07/2017.
 */


const config = require('config');
const request = require('request');



const messages = [
    "That looks like ",
    "That appears to be ",
    "Seems like ",
    "Might be ",
    "Could be ",
    "Probably ",
    "Possibly ",
    "I see ",
    "Looks like "
];

const vowels = "aeiou";

module.exports = {
    name: "Identify Image",
    usage: "identify [URL]",
    rateLimit: 10,
    commands: ["identify", "ident"],
    categories: ["image", "tools", "fun"],
    run: async function run(message, args, bot) {
        const url =  await bot.util.getImage(message, args);

        request({
            method: 'POST',
            json: true,
            url: "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&details=Celebrities&language=en",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("Commands.identify.key")
            },
            body: {
                url: url
            }
        }, async function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                message.replyLang("GENERIC_ERROR");
            }else if(body && body.description && body.description.captions && body.description.captions.length > 0) {
                message.replyLang(`IDENTIFY_RESPONSE_${bot.util.intBetween(0, 8)}`, {object: body.description.captions[0].text.replace("Xi Jinping", "Winnie The Pooh")});
            }else{
                message.replyLang("IDENTIFY_UNKNOWN");
            }
        })


    }
};