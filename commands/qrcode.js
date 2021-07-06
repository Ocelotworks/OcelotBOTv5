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
            let attachment = new Discord.MessageAttachment(`https://chart.googleapis.com/chart?chl=${encodeURIComponent(context.options.text)}&chs=200x200&cht=qr&chld=H|0`, "qr.png");
            return context.send({files: [attachment]});
        }catch(e){
            bot.raven.captureException(e);
            return context.send({content: "Error: "+e.message, ephemeral: true});
        }
    }
};