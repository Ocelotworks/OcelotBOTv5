const request = require('request');
const fs = require('fs');
const Discord = require('discord.js');
const gm = require('gm');
const config = require('config').get("Commands.sexysingle");
module.exports = {
    name: "Sexy Singles",
    usage: "sexysingle <user or url>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["sexysingle", "sexy", "single"],
    categories: ["image", "fun", "memes"],
    run: async function run(message, args, bot){
        message.channel.startTyping();
        async function downloadOrGet(url, fileName, outputFile){
            if(fs.existsSync(outputFile)) {
                try {
                    bot.logger.log("Using cached crush file");

                    let attachment = new Discord.Attachment(outputFile, config.get("filename"));

                    await message.channel.send("", attachment);
                    message.channel.stopTyping();
                }catch(e){
                    bot.raven.captureException(e);
                    fs.unlink(outputFile, function deleteFileCB(err){
                        if(err){
                            bot.raven.captureException(err);
                            bot.logger.error(`There was an error trying to delete ${outputFile}: ${err}`);
                        }else{
                            bot.logger.log(`Deleted ${outputFile}`);
                        }
                    });
                    message.replyLang("GENERIC_ERROR");
                    message.channel.stopTyping();
                }
            }else if(fs.existsSync(fileName)){
                bot.logger.log("Using cached avatar file");
                makeMeme(fileName, outputFile);
            }else{

                request(url).on("end", ()=>makeMeme(fileName, outputFile)).on("error", (err)=>{
                    bot.raven.captureException(err);
                    message.replyLang("GENERIC_ERROR");
                    message.channel.stopTyping();
                    fs.unlink(outputFile, function deleteFileCB(err){
                        if(err){
                            bot.raven.captureException(err);
                            bot.logger.error(`There was an error trying to delete ${outputFile}: ${err}`);
                        }else{
                            bot.logger.log(`Deleted ${outputFile}`);
                        }
                    });
                }).pipe(fs.createWriteStream(fileName));
            }
        }

        function makeMeme(fileName, outputFile){
            bot.raven.context(()=>{
                bot.raven.setContext({
                    user: {
                        id: message.author.id,
                        username: message.author.username
                    },
                    tags: {
                        command: "sexysingle"
                    },
                    extra: {
                        fileName: fileName,
                        outputFile: outputFile
                    }
                });
                gm(fileName)
                    .resize(500, 500)
                    .append(config.get("template"), true)
                    .toBuffer('PNG', async function crushToBuffer(err, buffer){
                        if(err){
                            bot.raven.captureException(err);
                            message.replyLang("CRUSH_ERROR");
                            message.channel.stopTyping();
                            bot.logger.error(`Error during composite stage of !crush: ${err.stack}`);
                            fs.unlink(fileName, function deleteFailedCrush(err){
                                if(err){
                                    bot.raven.captureException(err);
                                    bot.logger.error(`There was an error trying to delete ${fileName}: ${err}`);
                                }else{
                                    bot.logger.log(`Deleted ${fileName}`);
                                }
                            });
                        }else{
                            try{
                                let attachment = new Discord.Attachment(buffer, config.get("filename"));
                                message.channel.send("", attachment);
                                message.channel.stopTyping();
                            }catch(e){
                                bot.raven.captureException(e);
                                bot.logger.error("Error uploading crush file");
                                message.channel.stopTyping();
                                message.replyLang("GENERIC_ERROR");
                                console.log(e);
                            }finally{
                                fs.writeFile(outputFile, buffer, function(err){
                                    if(err){
                                        bot.raven.captureException(err);
                                        bot.logger.warn(`Error caching crush file: ${err}`);
                                    }
                                });
                            }
                        }
                    });
            });

        }

        const url =  await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            message.channel.stopTyping();
            return;
        }
        downloadOrGet(url, `${config.get("dir")}icon-${encodeURIComponent(url)}.png`, `${config.get("dir")}sexysingle-${encodeURIComponent(url)}.png`)

    }
};


