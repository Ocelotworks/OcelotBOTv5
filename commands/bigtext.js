const request = require('request');
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["bigtext", "big"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }

        if(args.length === 2 && args[1].startsWith("<:") && args[1].endsWith(">")){
            let id = args[1].substring(2).split(":")[1];
            if(id){
                id = id.substring(0,id.length-1);
                return message.channel.send(`https://cdn.discordapp.com/emojis/${id}.png?v=1`);
            }
        }

        message.channel.startTyping();
        request(`http://api.img4me.com/?font=arial&fcolor=${message.getSetting("bigtext.colour")}&size=35&type=png&text=${encodeURIComponent(message.cleanContent.substring(args[0].length+1))}`, (err, response, body)=>{
            if(err){
                bot.raven.captureException(err);
                message.channel.stopTyping();
                return message.replyLang("GENERIC_ERROR");
            }
            message.channel.send("", {
                embed: {
                    image: {
                        url: body
                    }
                }
            });
            message.channel.stopTyping();
        })
    },
    test: function(test){
        test('bigtext no text', function(t){
            const args = ["bigtext"];
            const message = {
                replyLang: function(message){
                    t.is(message, "GENERIC_TEXT")
                }
            };
            module.exports.run(message, args);
        });
        test('bigtext', function(t){
            const args = ["!bigtext", "test", "test"];
            const message = {
                cleanContent: "!bigtext test test",
                getSetting: function(key){
                    t.is(key, "bigtext.colour");
                    return null;
                },
                channel: {
                    send: function(message, attachment){
                        t.is(message, "");
                        if(attachment.embed.image.url.startsWith("http://img4me")){
                            t.pass();
                        }else{
                            t.fail();
                        }
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