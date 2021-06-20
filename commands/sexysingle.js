const request = require('request');
const fs = require('fs');
const Discord = require('discord.js');
const gm = require('gm');
const config = require('config').get("Commands.sexysingle");
let templates = [];
const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Sexy Singles",
    usage: "sexysingle :image?",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["sexysingle", "sexy", "single"],
    categories: ["memes"],
    unwholesome: true,
    slashHidden: true,
    init: function init(bot){
        bot.logger.log("Loading sexysingle templates");
         fs.readdir(__dirname+"/../static/sexysingle", function readDir(err, files){
             templates = files;
             bot.logger.log(`Loaded ${templates.length} templates.`);
         });

    },
    run: async function run(context, bot){
        async function downloadOrGet(url, fileName, outputFile){
            if(fs.existsSync(outputFile)) {
                try {
                    bot.logger.log("Using cached crush file");

                    let attachment = new Discord.MessageAttachment(outputFile, config.get("filename"));

                    await context.send({files: [attachment]});
                }catch(e){
                    fs.unlink(outputFile, function deleteFileCB(err){
                        if(err){
                            bot.logger.error(`There was an error trying to delete ${outputFile}: ${err}`);
                        }else{
                            bot.logger.log(`Deleted ${outputFile}`);
                        }
                    });
                    context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
                }
            }else if(fs.existsSync(fileName)){
                bot.logger.log("Using cached avatar file");
                makeMeme(fileName, outputFile);
            }else{

                request(url).on("end", ()=>makeMeme(fileName, outputFile)).on("error", (err)=>{
                    bot.raven.captureException(err);
                    context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
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
                        context.replyLang({content: "CRUSH_ERROR", ephemeral: true});
                        bot.logger.error(`Error during composite stage of !crush: ${err.stack}`);
                    } else {
                        try {
                            let attachment = new Discord.MessageAttachment(buffer, config.get("filename"));
                            context.send({files: [attachment]});
                        } catch (e) {
                            bot.raven.captureException(e);
                            bot.logger.error("Error uploading crush file");
                            context.replyLang({content: "GENERIC_ERROR", ephemeral: true});
                            console.log(e);
                        }
                    }
                });

        }

        const url = await Util.GetImage(bot, context);
        if (!url)
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});

        context.defer();
        return downloadOrGet(url, `${__dirname}/../${config.get("dir")}icon-${encodeURIComponent(url).substring(0, 256)}.png`)
    }
};


