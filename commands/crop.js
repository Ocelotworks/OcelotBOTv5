/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/02/2019
 * ╚════ ║   (ocelotbotv5) crop
 *  ════╝
 */
const config = require('config');
const request = require('request');
module.exports = {
    name: "Crop Image",
    usage: "crop [URL]",
    rateLimit: 50,
    detailedHelp: "Attempts to crop an image into a square in the best way possible",
    commands: ["crop"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        const url =  await bot.util.getImage(message, args);

        request({
            method: 'POST',
            json: true,
            url: "https://westeurope.api.cognitive.microsoft.com/vision/v2.0/areaOfInterest",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("Commands.identify.key")
            },
            body: {
                url: url
            }
        }, async function(err, resp, body){
            if(err)
                return message.replyLang("GENERIC_ERROR");
            if(body.areaOfInterest)
                return bot.util.processImageFilter(module, message, args, "crop", [body.areaOfInterest.w, body.areaOfInterest.h, body.areaOfInterest.x, body.areaOfInterest.y]);
            else
                message.replyLang("CROP_NO_AOI");
        })


    }
};