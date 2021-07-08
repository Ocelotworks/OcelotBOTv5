/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 29/01/2019
 * ╚════ ║   (ocelotbotv5) snapcode
 *  ════╝
 */


const Discord = require('discord.js');
module.exports = {
    name: "Snapcode Generator",
    usage: "snapcode :username",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["snapcode"],
    run: function(context, bot){
        context.defer();
        const url = `https://app.snapchat.com/web/deeplink/snapcode?username=${encodeURIComponent(context.options.username)}&type=PNG&size=240`;
        if(context.interaction)
            return context.send(url);
        try {
            let attachment = new Discord.MessageAttachment(url, "snapcode.png");
            context.send({files: [attachment]});
        }catch(e) {
            context.send({content: "Error: " + e.message, ephemeral: true});
            bot.raven.captureException(e);
        }
    }
};