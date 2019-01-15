/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const cleverbot = require('cleverbot.io');
let cbot = new cleverbot(config.get("user"), config.get("key"));
let session;
module.exports = {
    name: "Artifical Intelligence",
    usage: "ai <message>",
    categories: ["fun", ],
    rateLimit: 5,
    commands: ["ai","cleverbot"],
    run: function run(message, args, bot) {
        if(args.length < 2){
            message.replyLang("8BALL_NO_QUESTION");
            return;
        }
        try {
            cbot.setNick(message.channel.id);
            message.channel.startTyping();
            cbot.create(function(err, session){
                if(err) {
                    message.channel.stopTyping();
                    return message.replyLang("GENERIC_ERROR");
                }

                cbot.ask(message.cleanContent.substring(args[0].length+1), function(err, response){
                    message.channel.stopTyping();
                    if(err)
                        return message.replyLang("GENERIC_ERROR");

                    message.channel.send(response);


                });

            });
        }catch(e){
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};