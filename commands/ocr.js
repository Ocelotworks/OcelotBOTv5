const request = require('request'),
    config = require('config');
const Util = require("../util/Util");

module.exports = {
    name: "OCR",
    usage: "ocr :image?",
    rateLimit: 10,
    detailedHelp: "Optical Character Recognition - Finds text in an image",
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["ocr"],
    run: async function (context, bot) {
        const url = await Util.GetImage(bot, context)
        if (!url) {
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});
        }
        context.defer();
        request.post("https://api.ocr.space/parse/image", {
            form: {
                url: url,
                apikey: config.get("API.ocr.key"),
                OCREngine: 2,
            }
        }, async function OCRResponse(err, resp, body) {
            if (err) {
                bot.logger.error(err);
                if (err.message.ErrorMessage) {
                    return context.send({content: err.message.ErrorMessage.join("\n"), ephemeral: true});
                }
                bot.raven.captureException(err);
                return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
            }
            try {
                let output = "";
                const data = JSON.parse(body);
                if (!data.ParsedResults) {
                    bot.logger.log(data);
                    return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
                }
                if (data.ParsedResults.length === 0)
                    return context.sendLang({content: "B_NO_TEXT", ephemeral: true});


                for (let i = 0; i < data.ParsedResults.length; i++) {
                    output += data.ParsedResults[i].ParsedText + "\n"
                }

                if (output === "\n")
                    return context.sendLang({content: "B_NO_TEXT", ephemeral: true});

                return context.send(`\`\`\`\n${output}\n\`\`\``);
            } catch (e) {
                console.log(e);
                bot.logger.error(e);
                bot.raven.captureException(e);
                return context.sendLang("GENERIC_ERROR");
            }
        });
    }
};