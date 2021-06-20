const Discord = require('discord.js');
module.exports = {
    name: "QR Code Generator",
    usage: "qr :text+",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["qr", "qrcode"],
    slashHidden: true,
    run: function(context, bot){
        context.defer();
        try {
            let attachment = new Discord.MessageAttachment(`https://chart.googleapis.com/chart?chl=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&chs=200x200&cht=qr&chld=H|0`, "qr.png");
            context.send({files: [attachment]});
        }catch(e){
            context.send({content: "Error: "+e.message, ephemeral: true});
            bot.raven.captureException(e);
        }
    }
};