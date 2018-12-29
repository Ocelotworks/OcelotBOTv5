const request = require('request');
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext <text>",
    categories: ["image", "fun"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["bigtext", "big"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }

        message.channel.startTyping();
        request(`http://api.img4me.com/?font=arial&fcolor=FFFFFF&size=35&type=png&text=${encodeURIComponent(message.cleanContent.substring(args[0].length+1))}`, (err, response, body)=>{
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
                channel: {
                    send: function(message){
                        t.is(message, ":bangbang: You must provide some text! i.e !bigtext hello world");
                    }
                }
            };
            module.exports.run(message, args);
        });
        test('bigtext', function(t){
            const args = ["!bigtext", "test", "test"];
            const message = {
                cleanContent: "!bigtext test test",
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