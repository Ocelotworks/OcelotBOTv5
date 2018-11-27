const Discord = require('discord.js');
module.exports = {
    name: "Barcode Generator",
    usage: "barcode <text>",
    rateLimit: 10,
    categories: ["image", "tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["barcode"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.send(`:bangbang: You must provide some text! i.e ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}barcode hello world`);
            return;
        }

        message.channel.startTyping();
        try {
            let attachment = new Discord.Attachment(`https://www.barcodesinc.com/generator/image.php?code=${encodeURIComponent(message.cleanContent.substring(args[0].length + 1))}&style=197&type=C128B&width=${167+(message.content.length*5)}&height=50&xres=1&font=3`, "barcode.png");
            message.channel.send("", attachment);
        }catch(e){
            message.channel.send("Error: "+e.message);
            bot.raven.captureException(e);
        }finally{
            message.channel.stopTyping(true);
        }
    },
    test: function(test){
        test('barcode no text', function(t){
            const args = ["barcode"];
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, ":bangbang: You must provide some text! i.e !barcode hello world");
                    }
                }
            };
            module.exports.run(message, args);
        });
        test('barcode', function(t){
            const args = ["!barcode", "test", "test"];
            const message = {
                cleanContent: "!barcode test test",
                channel: {
                    send: function(message, attachment){
                        t.is(message, "");
                        t.is(attachment.file.attachment, 'https://www.barcodesinc.com/generator/image.php?code=test%20test&style=197&type=C128B&width=277&height=50&xres=1&font=3');
                        t.is(attachment.file.name, 'barcode.png');
                    },
                    startTyping: function(){
                        t.pass();
                    },
                    stopTyping: function(){
                        t.pass();
                    }
                },
                content: "!achievement test test"
            };
            module.exports.run(message, args);
        });
    }
};