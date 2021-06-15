const Discord = require('discord.js');
module.exports = {
    name: "Barcode Generator",
    usage: "barcode <text>",
    rateLimit: 10,
    detailedHelp: "Generates a barcode. C128B, to be precise.",
    usageExample: "barcode hello",
    categories: ["barcodes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["barcode"],
    slashOptions: [{type: "STRING", name: "code", description: "The text/number to encode", required: true}],
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }

        message.channel.startTyping();
        try {
            let attachment = new Discord.MessageAttachment(`https://www.barcodesinc.com/generator/image.php?code=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&style=197&type=C128B&width=${167+(message.content.length*5)}&height=50&xres=1&font=3`, "barcode.png");
            message.channel.send({files: [attachment]});
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    },
    runSlash(interaction){
        return interaction.reply(`https://www.barcodesinc.com/generator/image.php?code=${encodeURIComponent(interaction.options.get("code").value)}&style=197&type=C128B&width=${167+(interaction.options.get("code").value.length*5)}&height=50&xres=1&font=3`)
    }

};