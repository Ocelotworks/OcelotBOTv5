

const Discord = require('discord.js');
module.exports = {
    name: "Maxi Code Generator",
    usage: "maxi :text+",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["maxi", "maxicode"],
    slashCategory: "barcode",
    run:  function(context, bot){
        context.defer();
        try {
            let attachment = new Discord.MessageAttachment(`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(context.options.text)}&code=MaxiCode&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=396&imagetype=gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`, "qr.png");
            context.send({files: [attachment]});
        }catch(e){
            context.send({content: "Error: "+e.message, ephemeral: true});
            bot.raven.captureException(e);
        }
    }
};