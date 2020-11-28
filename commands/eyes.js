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
    categories: ["image"],
    commands: ["eyes", "eye"],
    init: async function(){
        red = await canvas.loadImage(__dirname+"/../static/eyes/red.png");
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
        }, async function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
            }else if(body.length > 0) {

                let image = await canvas.loadImage(url);
                const cnv = canvas.createCanvas(image.width, image.height);
                const ctx = cnv.getContext("2d");
                ctx.drawImage(image, 0,0);
                for(let i = 0; i < body.length; i++){
                    let face = body[i];
                    if(face.faceLandmarks){
                        let leftEye = face.faceLandmarks.pupilLeft;
                        let rightEye = face.faceLandmarks.pupilRight;


                        if(rightEye)
                            ctx.drawImage(red, rightEye.x-(red.width/2), rightEye.y-(red.height/2));

                        if(leftEye)
                           ctx.drawImage(red, leftEye.x-(red.width/2), leftEye.y-(red.height/2));


                    }
                }


                let img = cnv.toBuffer("image/png");
                let attachment = new Discord.MessageAttachment(img, (url.indexOf("SPOILER_") > -1 ? "SPOILER_" : "")+"eyes.png");
                message.channel.send("", attachment);

                message.channel.stopTyping(true);

            }else{
                message.replyLang("FACE_NO_FACES");
            }
        })
    }
};