const request = require('request');
const config = require('config');
const Discord = require('discord.js');
module.exports = {
    name: "Screenshot Website",
    usage: "screenshot <URL>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["screenshot", "screencap"],
    categories: ["image", "tools"],
    unwholesome: true,
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.send(`Usage: ${message.getSetting("prefix")}screenshot <URL> e.g ${message.getSetting("prefix")}screenshot http://google.com`);
        }else{
            message.channel.startTyping();
            request({
                encoding: null,
                url: `http://api.screenshotlayer.com/api/capture?access_key=${config.get("Commands.screenshot.key")}&url=${encodeURIComponent(args[1].startsWith("http") ? args[1] : "http://"+args[1])}&viewport=${config.get("Commands.screenshot.viewport")}&width=${config.get("Commands.screenshot.width")}`
            }, function(err, resp, body){
                if(err){
                    bot.raven.captureException(err);
                    message.channel.send("Error getting response. Try again later.");
                }else if(body.toString().startsWith("{")){
                   try {
                       const data = JSON.parse(body.toString());
                       if(!data.success){
                           if(data.error){
                               if(data.error.info){
                                   if(data.error.info.indexOf("subscription") > -1){
                                        message.channel.send(`Screenshot quota has been reached for this month. If you would like to help me raise this quota, consider ${message.getSetting("prefix")}premium`)
                                   }else {
                                       message.channel.send(data.error.info);
                                   }
                               }else{
                                   message.channel.send("Error "+data.error.code);
                               }
                           }else{
                               message.channel.send("Unknown Error. Try again later.");
                           }
                       }else{
                           console.log(data);
                           bot.logger.warn("Unknown response!!");
                           message.channel.send("Got an unexpected response. Try again later.");
                       }
                   }catch(e){
                       bot.raven.captureException(e);
                       message.channel.send("Got a malformed response. Try again later.")
                   }
                   message.channel.stopTyping(true);
               }else{
                   let attachment = new Discord.MessageAttachment(body, "website.png");
                   message.channel.send(attachment);
                   message.channel.stopTyping(true);
               }
            });
        }
    }
};