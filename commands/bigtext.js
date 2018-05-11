const request = require('request');
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext <text>",
    categories: ["image", "fun"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["bigtext", "big"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.channel.reply(":bangbang: You must provide some text! i.e !bigtext hello world")
            return;
        }

        message.channel.startTyping();
        request(`http://api.img4me.com/?font=arial&fcolor=FFFFFF&size=35&type=png&text=${encodeURIComponent(message.content.substring(args[0].length+1))}`, (err, response, body)=>{
            message.channel.send("", {
                embed: {
                    image: {
                        url: body
                    }
                }
            });
            message.channel.stopTyping();
        })
    }
};