/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const cleverbot = require('cleverbot.io');
let cbot = new cleverbot(config.get("user"), config.get("key"));

module.exports = {
    name: "Artifical Intelligence",
    usage: "ai <message>",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai","cleverbot"],
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");
        try {
            cbot.setNick(message.channel.id);
            message.channel.startTyping();
            cbot.create(function(err, session){
                if(err) {
                    message.channel.stopTyping();
                    return message.replyLang("GENERIC_ERROR");
                }

                try {
                    cbot.ask(message.cleanContent.substring(args[0].length + 1), function (err, response) {
                        message.channel.stopTyping();
                        if (err)
                            return message.replyLang("GENERIC_ERROR");

                        message.channel.send(response);


                    });
                }catch(e){
                    message.replyLang("GENERIC_ERROR");
                }

            });
        }catch(e){
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};