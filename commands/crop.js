/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/02/2019
 * ╚════ ║   (ocelotbotv5) crop
 *  ════╝
 */
const config = require('config');
const Util = require("../util/Util");
const Image = require("../util/Image");
const {axios} = require('../util/Http');
module.exports = {
    name: "Crop Image",
    usage: "crop :image?",
    rateLimit: 50,
    detailedHelp: "Attempts to crop an image into a square in the best way possible",
    commands: ["crop"],
    categories: ["image"],
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        let result = await axios.post("https://westeurope.api.cognitive.microsoft.com/vision/v2.0/areaOfInterest", {url}, {
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("API.msVision.key")
            }
        });

        if(!result.data.areaOfInterest)
            return context.sendLang({content: "CROP_NO_AOI", ephemeral: true})

        return Image.ImageProcessor(bot, context, {
            components: [{url, pos: {
                    x: -result.data.areaOfInterest.x, // Invert the X/Y
                    y: -result.data.areaOfInterest.y,
                    w:  result.data.areaOfInterest.w,
                    h:  result.data.areaOfInterest.h
            }}]
        }, 'crop');
    }
};