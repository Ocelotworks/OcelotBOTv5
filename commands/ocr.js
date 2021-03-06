const request = require('request'),
    config = require('config');

module.exports = {
    name: "OCR",
    usage: "ocr <url>",
    rateLimit: 10,
    detailedHelp: "Optical Character Recognition - Finds text in an image",
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["ocr"],
    run: async function (message, args, bot) {
        const url = await bot.util.getImage(message, args);
        if (!url) {
            message.replyLang("CRUSH_NO_USER");
            message.channel.stopTyping(true);
            return;
        }

        request.post("https://api.ocr.space/parse/image", {
            form: {
                url: url,
                apikey: config.get("Commands.b.key"),
                OCREngine: 2,
            }
        }, async function OCRResponse(err, resp, body) {
            if (err) {
                bot.logger.error(err);
                if (err.ErrorMessage) {
                    message.channel.send(err.ErrorMessage.join("\n"));
                } else {

                    bot.raven.captureException(err);
                    message.replyLang("GENERIC_ERROR");
                }
            } else {
                try {
                    let output = "";
                    const data = JSON.parse(body);
                    if (!data.ParsedResults) {
                        bot.logger.log(data);
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    if (data.ParsedResults.length === 0) {
                        return message.replyLang("B_NO_TEXT");
                    }

                    for (let i = 0; i < data.ParsedResults.length; i++) {
                        output += data.ParsedResults[i].ParsedText + "\n"
                    }

                    if (output === "\n") {
                        return message.replyLang("B_NO_TEXT");
                    }


                    message.channel.send(`\`\`\`\n${output}\n\`\`\``);

                } catch (e) {
                    console.log(e);
                    bot.logger.error(e);
                    bot.raven.captureException(e);
                    message.replyLang("GENERIC_ERROR");
                }
            }

        });

        message.channel.stopTyping();
    }
};