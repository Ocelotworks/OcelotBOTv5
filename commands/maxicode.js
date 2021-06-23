

const Discord = require('discord.js');
module.exports = {
    name: "Maxi Code Generator",
    usage: "maxi <text>",
    rateLimit: 10,
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["maxi", "maxicode"],
    run:  function(context, bot){
        if(!args[1]){
            message.channel.send(`:bangbang: You must provide some text! i.e ${args[0]} hello world`);
            return;
        }

        message.channel.startTyping();
        try {
            ////`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(message.content.substring(args[0].length + 1))}&code=MaxiCode&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`

            let attachment = new Discord.MessageAttachment(`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&code=MaxiCode&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=396&imagetype=gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`, "qr.png");
            message.channel.send({files: [attachment]});
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    }
};