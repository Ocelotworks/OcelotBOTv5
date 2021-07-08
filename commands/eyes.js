/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 18/01/2019
 * ╚════ ║   (ocelotbotv5) eyes
 *  ════╝
 */
const config = require('config');
const Util = require("../util/Util");
const Image = require("../util/Image");
const {axios} = require('../util/Http');
module.exports = {
    name: "Red Eyes",
    usage: "eyes :image?",
    accessLevel: 0,
    rateLimit: 20,
    detailedHelp: "Adds red eyes to faces in the image",
    categories: ["image", "filter"],
    commands: ["eyes", "eye"],
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        let result = await axios.post("https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=true", {url}, {
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("API.msFaceDetect.key")
            },
        })

        if (result.data.length <= 0)
            return context.sendLang({content: "FACE_NO_FACES", ephemeral: true});

        let payload = {
            "components": [
                {"url": url}
            ]
        }

        for (let i = 0; i < result.data.length; i++) {
            let face = result.data[i];
            if (face.faceLandmarks) {
                let leftEye = face.faceLandmarks.pupilLeft;
                let rightEye = face.faceLandmarks.pupilRight;


                if (rightEye)
                    payload.components.push({
                        url: "eyes/red.png",
                        local: true,
                        pos: {
                            x: rightEye.x - 300,
                            y: rightEye.y - 168,
                        }
                    })

                if (leftEye)
                    payload.components.push({
                        url: "eyes/red.png",
                        local: true,
                        pos: {
                            x: leftEye.x - 300,
                            y: leftEye.y - 168,
                        }
                    })
            }
        }

        return Image.ImageProcessor(bot, context, payload, "eyes");
    }
};