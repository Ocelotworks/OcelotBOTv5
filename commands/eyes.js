/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 18/01/2019
 * ╚════ ║   (ocelotbotv5) eyes
 *  ════╝
 */
const request = require('request');
const config = require('config');
const canvas = require('canvas');
const Discord = require('discord.js');
let red;
module.exports = {
    name: "Red Eyes",
    usage: "eyes [url or @user]",
    accessLevel: 0,
    rateLimit: 20,
    detailedHelp: "Adds red eyes to faces in the image",
    categories: ["image", "filter"],
    commands: ["eyes", "eye"],
    init: async function () {
        red = await canvas.loadImage(__dirname + "/../static/eyes/red.png");
    },
    run: async function run(message, args, bot) {
        const url = await bot.util.getImage(message, args);
        bot.logger.log(url);
        request({
            method: 'POST',
            json: true,
            url: "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=true&returnFaceAttributes=age,gender",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("Commands.face.key")
            },
            body: {
                url: url
            }
        }, async function (err, resp, body) {
            if (err) {
                bot.raven.captureException(err);
            } else if (body.length > 0) {
                let payload = {
                    "components": [
                        {"url": url}
                    ]
                }

                for (let i = 0; i < body.length; i++) {
                    let face = body[i];
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

                return bot.util.imageProcessor(message, payload, "eyes");

            } else {
                message.replyLang("FACE_NO_FACES");
            }
        })
    }
};