const request = require('request');
const config = require('config');
module.exports = {
    name: "Face Recognition",
    usage: "face [url] or embed",
    accessLevel: 0,
    rateLimit: 10,
    categories: ["tools", "fun", "image"],
    commands: ["face", "age"],
    run: async function run(message, args, bot) {
        const url = await bot.util.getImage(message, args);

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
                    message.replyLang("FACE_RESPONSE", body[0].faceAttributes);
                }else{
                    let output = "";
                    for(let i = 0; i < body.length; i++){
                        output += await bot.lang.getTranslation(message.guild.id, "FACE_RESPONSE", body[i].faceAttributes);
                        output += "\n";//i < body.length-2 ? ", " : i === body.length-2 ? " and " : "."
                    }
                    message.channel.send(await bot.lang.getTranslation(message.guild.id, "FACE_RESPONSE_MULTIPLE", {num: body.length-1})+"\n "+output);

                }

            }else{
                message.replyLang("FACE_NO_FACES");
            }
        })
    }
};