const Discord = require('discord.js');
module.exports = {
    name: "QR Code Generator",
    usage: "qr <text>",
    rateLimit: 10,
    categories: ["image", "tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["qr", "qrcode"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.send(":bangbang: You must provide some text! i.e !qr hello world");
            return;
        }

        message.channel.startTyping();
        try {
            let attachment = new Discord.Attachment(`https://chart.googleapis.com/chart?chl=${encodeURIComponent(message.content.substring(args[0].length + 1))}&chs=200x200&cht=qr&chld=H|0`, "qr.png");
            message.channel.send("", attachment);
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    }
};