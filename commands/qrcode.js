const Discord = require('discord.js');
module.exports = {
    name: "QR Code Generator",
    usage: "qr <text>",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["qr", "qrcode"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.send(`:bangbang: You must provide some text! i.e ${args[0]} hello world`);
            return;
        }

        message.channel.startTyping();
        try {
            let attachment = new Discord.MessageAttachment(`https://chart.googleapis.com/chart?chl=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&chs=200x200&cht=qr&chld=H|0`, "qr.png");
            message.channel.send({files: [attachment]});
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    }
};