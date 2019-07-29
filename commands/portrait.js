const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
module.exports = {
    name: "Portrait Generator",
    usage: "portrait <URL or @User>",
    detailedHelp: "Uses AI to create a portrait painting",
    categories: ["fun","image"],
    rateLimit: 50,
    commands: ["portrait"],
    run: async function (message, args, bot) {
        let image = await bot.util.getImage(message, args);
        console.log(image);
        if(!image)
            return message.replyLang("GENERIC_NO_IMAGE");

        message.channel.startTyping();


        const fileName = `${__dirname}/../temp/${Math.random()}.png`;
        let shouldProcess = false;
        request.get(image)
        .on("response", function requestResponse(resp){
            shouldProcess = !(resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf("image") === -1);
        })
        .on("error", function requestError(err){
            bot.raven.captureException(err);
            bot.logger.log(err);
            shouldProcess = false;
        })
        .on("end", function requestEnd() {
            if(!shouldProcess){
                message.replyLang("GENERIC_NO_IMAGE_URL");
                fs.unlink(fileName, function unlinkInvalidFile(err){
                    if(err)
                        bot.logger.error(err);
                });
                return;
            }


            request({
                method: "POST",
                uri: "https://aiportraits.com/art-api/aiportrait/",
                formData: {
                    file: fs.createReadStream(fileName)
                }
            }, function(err, resp, body){
                if(err)
                    return console.error(err);
                fs.unlink(fileName, function unlinkFile(err){
                    if(err)
                        bot.logger.error(err);
                });


                try{
                    let data = JSON.parse(body);
                    console.log(data);
                    message.channel.stopTyping(true);
                    if(data.ERROR)
                        return message.channel.send(data.ERROR);

                    let result = data.filename;

                    let embed = new Discord.RichEmbed();
                    embed.setImage(`https://aiportraits.com/portraits_small/${result}`);
                    message.channel.send(embed);


                }catch(e){
                    console.error(e);
                }
            })

        }).pipe(fs.createWriteStream(fileName));

    }
};