const request = require('request'),
    config = require('config');

module.exports = {
    name: "B-ify",
    usage: "b <url>",
    rateLimit: 10,
    detailedHelp: "Adds a 🅱 into the image wherever appropriate",
    categories: ["image", "filter", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["b", "bify"],
    run: async function (message, args, bot) {
        const url = await bot.util.getImage(message, args);
        if (!url) {
            if (args[1]) {
                let output = "";
                const line = (message.cleanContent.substring(message.cleanContent.indexOf(args[1]))).split(" ");
                for (let w = 0; w < line.length; w++) {
                    const text = line[w];
                    if (bot.util.vowels.indexOf(text.substring(1, 2)) > -1) {
                        output += "🅱" + text.substring(1) + " ";
                    } else {
                        output += text + " ";
                    }
                }
                message.channel.send(output);
                return;
            } else {
                message.replyLang("CRUSH_NO_USER");
                message.channel.stopTyping(true);
                return;
            }
        }


        request.post("https://api.ocr.space/parse/image", {
            form: {
                url: url,
                apikey: config.get("API.ocr.key"),
                isOverlayRequired: true,
                OCREngine: url.endsWith("gif") ? 1 : 2,
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
                    const payload = {
                        "components": [
                            {"url": url}
                        ]
                    };
                    let positions = [];
                    const data = JSON.parse(body);
                    if (!data.ParsedResults) {
                        bot.logger.log(data);
                        message.replyLang("GENERIC_ERROR");
                        return;
                    }
                    const results = data.ParsedResults[0];
                    if (results && results.TextOverlay && results.TextOverlay.Lines.length > 0) {
                        const lines = results.TextOverlay.Lines;
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            for (let w = 0; w < line.Words.length; w++) {
                                const word = line.Words[w];
                                const text = word.WordText.toLowerCase();
                                if (bot.util.vowels.indexOf(text.substring(1, 2)) > -1) {
                                    payload.components.push({
                                        url: "b.png",
                                        local: true,
                                        pos: {
                                            x: word.Left-(word.Height/2),
                                            y: word.Top,
                                            w: word.Height,
                                            h: word.Height,
                                        }
                                    })
                                    positions.push(word);
                                }
                            }
                        }

                        if (positions.length === 0) {
                            bot.logger.log("Couldn't find any vowels, just putting a B at the start of the sentence");
                            payload.components.push({
                                url: "b.png",
                                local: true,
                                pos: {
                                    x: lines[0].Words[0].Left-(lines[0].Words[0].Height/2),
                                    y: lines[0].Words[0].Top,
                                    w: lines[0].Words[0].Height,
                                    h: lines[0].Words[0].Height,
                                }
                            })
                        }

                        return Image.ImageProcessor(bot, context,  payload, "eyes");
                    } else {
                        message.replyLang("B_NO_TEXT");
                    }
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