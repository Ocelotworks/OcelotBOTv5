const config = require('config');
const Util = require("../util/Util");
const {axios} = require('../util/Http');
module.exports = {
    name: "Face Recognition",
    usage: "face :image?",
    accessLevel: 0,
    rateLimit: 10,
    detailedHelp: "Find faces in an image and guess their age.",
    usageExample: "age @Big P",
    responseExample: "🤔 That looks like a 22 year old male.",
    categories: ["tools", "image"],
    commands: ["face", "age"],
    run: async function run(context, bot) {
        let url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        const result = await axios.post("https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender", {url}, {
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": config.get("API.msFaceDetect.key")
            },
        })
        if (result.data.length <= 0)
            return context.sendLang({content: "FACE_NO_FACES", ephemeral: true});

        if (result.data.length === 1)
            return context.sendLang("FACE_RESPONSE", result.data[0].faceAttributes);

        let output = "";
        for (let i = 0; i < result.data.length; i++) {
            output += context.getLang("FACE_RESPONSE", result.data[i].faceAttributes)
            output += "\n";//i < body.length-2 ? ", " : i === body.length-2 ? " and " : "."
        }
        return context.send(context.getLang("FACE_RESPONSE_MULTIPLE", {num: result.data.length}) + "\n " + output);
    }
};