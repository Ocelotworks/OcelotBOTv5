const request = require('request');
const config = require('config');
const Discord = require('discord.js');
module.exports = {
    name: "Screenshot Website",
    usage: "screenshot :url",
    usageExample: "screenshot https://google.com",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["screenshot", "screencap"],
    categories: ["image", "tools"],
    unwholesome: true,
    run: function(context, bot){
        request({
            encoding: null,
            url: `http://api.screenshotlayer.com/api/capture?access_key=${config.get("API.screenshotLayer.key")}&url=${encodeURIComponent(context.options.url.startsWith("http") ? context.options.url : "http://"+context.options.url)}&viewport=800x600&width=480`
        }, function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                return context.send({content: "Error getting response. Try again later.", ephemeral: true});
            }
            if(body.toString().startsWith("{")){
               try {
                   const data = JSON.parse(body.toString());
                   if(!data.success)
                      return context.send({content: "Got an unexpected response. Try again later.", ephemeral: true});
                   let attachment = new Discord.MessageAttachment(body, "website.png");
                   context.send({files: [attachment]});
               }catch(e){
                   bot.raven.captureException(e);
                   return context.send({content: "Got a malformed response. Try again later.", ephemeral: true});
               }
           }
        });
    }
};