/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const Cleverbot = require('cleverbot');


let clev = new Cleverbot({
    key: config.get("key")
});
module.exports = {
    name: "Artifical Intelligence",
    usage: "ai <message>",
    detailedHelp: "Ask a question to the Artifical Intelligence",
    usageExample: "ai what is the meaning of life?",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai","cleverbot"],
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");
        try {
            message.channel.startTyping();
            let input = message.cleanContent.substring(args[0].length + 1);
            let response = await clev.query(input);

            if(response.output)
                message.channel.send(response.output);
            else
                message.replyLang("GENERIC_ERROR");

            message.channel.stopTyping();

        }catch(e){
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};