/**
 * Created by Peter on 18/07/2017.
 */

const request = require('request');
const config = require('config');
module.exports = {
    name: "Face Recognition",
    usage: "face [url] or embed",
    accessLevel: 0,
    commands: ["face", "age"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        recv.simulateTyping(channel);

        if(event.d.attachments[0]){
            identify(event.d.attachments[0].url);
        }else if(args[1] && args[1].startsWith("http")){
            identify(args[1]);
        }else{
            recv.getMessages({
                channelID: channel,
                limit: 100
            }, async function(err, resp){
                for(var i = resp.length-1; i >= 0; i--){
                    var message = resp[i];
                    if(message.attachments[0] && message.attachments[0].url){
                        identify(message.attachments[0].url);
                        return;
                    }
                }
                recv.sendMessage({
                    to: channel,
                    message: await bot.lang.getTranslation(server, "FACE_NO_IMAGE")
                });
            });
        }

        function identify(url){
            request({
                method: 'POST',
                json: true,
                url: "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender",
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
                    if(body.length === 1){
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "FACE_RESPONSE", {age: body[0].faceAttributes.age, gender: body[0].faceAttributes.gender})
                        });
                    }else{
                        var output = "";
                        for(var i = 0; i < body.length; i++){
                            output += await bot.lang.getTranslation(server, "FACE_RESPONSE", body[i].faceAttributes);
                            output += i < body.length-2 ? ", " : i === body.length-2 ? " and " : "."
                        }
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "FACE_RESPONSE_MULTIPLE", {num: body.length-1})+" "+output
                        });
                    }

                }else{
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "FACE_NO_FACES")
                    });
                }
            })
        }

    }
};