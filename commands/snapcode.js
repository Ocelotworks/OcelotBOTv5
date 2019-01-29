/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 29/01/2019
 * ╚════ ║   (ocelotbotv5) snapcode
 *  ════╝
 */


const Discord = require('discord.js');
module.exports = {
    name: "Snapcode Generator",
    usage: "snapcode <username>",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["snapcode"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.send(`:bangbang: You must provide some text! i.e ${args[0]} username`);
            return;
        }

        message.channel.startTyping();
        try {
            let attachment = new Discord.Attachment(`https://app.snapchat.com/web/deeplink/snapcode?username=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&type=PNG&size=240`, "snapcode.png");
            message.channel.send("", attachment);
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    }
};