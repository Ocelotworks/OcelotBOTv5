const   Discord = require('discord.js'),
        request = require('request') ,
        config  = require('config'),
        fs      = require('fs'),
        canvas  = require('canvas');

let b;
module.exports = {
    name: "B-ify",
    usage: "b <url>",
    rateLimit: 10,
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["b", "bify"],
    init: async function(){
        b = await canvas.loadImage("static/b.png");
    },
    run: async function(message, args, bot){
        const url =  await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            message.channel.stopTyping(true);
            return;
        }


        request.post("https://api.ocr.space/parse/image", {
            form: {
                url: url,
                apikey: config.get("Commands.b.key"),
                isOverlayRequired: true
            }
        }, async function OCRResponse(err, resp, body){
            if(err){
                bot.logger.error(err);
                bot.raven.captureException(err);
                message.replyLang("GENERIC_ERROR");
            }else{
                try{
                    let positions = [];
                    const data = JSON.parse(body);
                    const results = data.ParsedResults[0];
                    if(results && results.TextOverlay){
                        const lines = results.TextOverlay.Lines;
                        for(let i = 0; i < lines.length; i++){
                            const line = lines[i];
                            for(let w = 0; w < line.Words.length; w++){
                                const word = line.Words[w];
                                const text = word.WordText;
                                if(bot.util.vowels.indexOf(text.substring(1,2)) > -1){
                                    positions.push(word);
                                }
                            }
                        }

                        if(positions.length === 0){
                            bot.logger.log("Couldn't find any vowels, just putting a B at the start of the sentence");
                            positions.push(lines[0].Words[0]);
                        }
                        //const filePath = "temp/"+encodeURIComponent(url);

                        const image = await canvas.loadImage(url);


                        const canv = canvas.createCanvas(image.width, image.height);
                        const ctx = canv.getContext("2d");


                        ctx.drawImage(image,0,0);

                        for(let i = 0; i < positions.length; i++){
                            const word = positions[i];
                            ctx.drawImage(b, word.Left, word.Top, word.Height, word.Height);
                        }

                        const buff = canv.toBuffer("image/png");
                        bot.logger.log("Got buffer");
                        const attachment = new Discord.Attachment(buff, "b.png");
                        message.channel.send("", attachment);
                    }else{
                        message.channel.send(":warning: Couldn't find any text in that image.");
                    }
                }catch(e){
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