const request = require('request');
const fs = require('fs');
const Discord = require('discord.js');
const gm = require('gm');
const config = require('config').get("Commands.sexysingle");
let templates = [];

module.exports = {
    name: "Sexy Singles",
    usage: "sexysingle <@user or url>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["sexysingle", "sexy", "single"],
    categories: ["memes"],
    unwholesome: true,
    init: function init(bot){
        bot.logger.log("Loading sexysingle templates");
         fs.readdir(__dirname+"/../static/sexysingle", function readDir(err, files){
             templates = files;
             bot.logger.log(`Loaded ${templates.length} templates.`);
         });

    },
    run: async function run(message, args, bot){
        //It's sad to me that I have to do this
        //And completely indicative of the user base of OcelotBOT
        if(args[1] && args[1].toLowerCase() === "dice")
            return bot.commands["sexydice"](message, args, bot);


        message.channel.startTyping();
        async function downloadOrGet(url, fileName, outputFile){
            if(fs.existsSync(outputFile)) {
                try {
                    bot.logger.log("Using cached crush file");

                    let attachment = new Discord.MessageAttachment(outputFile, config.get("filename"));

                    await message.channel.send({files: [attachment]});
                    message.channel.stopTyping();
                }catch(e){
                    fs.unlink(outputFile, function deleteFileCB(err){
                        if(err){
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
                            bot.logger.error(`There was an error trying to delete ${outputFile}: ${err}`);
                        }else{
                            bot.logger.log(`Deleted ${outputFile}`);
                        }
                    });
                }).pipe(fs.createWriteStream(fileName));
            }
        }

        function makeMeme(fileName) {
            gm(fileName)
                .resize(500, 500)
                .append(__dirname + "/../static/sexysingle/" +bot.util.arrayRand(templates), true)
                .toBuffer('PNG', async function crushToBuffer(err, buffer) {
                    if (err) {
                        message.replyLang("CRUSH_ERROR");
                        message.channel.stopTyping();
                        bot.logger.error(`Error during composite stage of !crush: ${err.stack}`);
                    } else {
                        try {
                            let attachment = new Discord.MessageAttachment(buffer, config.get("filename"));
                            message.channel.send({files: [attachment]});
                            message.channel.stopTyping();
                        } catch (e) {
                            bot.raven.captureException(e);
                            bot.logger.error("Error uploading crush file");
                            message.channel.stopTyping();
                            message.replyLang("GENERIC_ERROR");
                            console.log(e);
                        }
                    }
                });

        }

        const url =  await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            return message.channel.stopTyping();
        }
        return downloadOrGet(url, `${__dirname}/../${config.get("dir")}icon-${encodeURIComponent(url).substring(0, 256)}.png`)
    }
};


