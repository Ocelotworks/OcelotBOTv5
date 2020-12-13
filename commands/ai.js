/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const Cleverbot = require('cleverbot');


let contexts = {};

let contextIDs = {};

let clev = new Cleverbot({
    key: config.get("key")
});
module.exports = {
    name: "Artificial Intelligence",
    usage: "ai <message>",
    detailedHelp: "Ask a question to the Artificial Intelligence",
    usageExample: "ai what is the meaning of life?",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai","cleverbot"],
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");
        try {
            message.channel.startTyping();
            let input = encodeURIComponent(message.cleanContent.substring(args[0].length + 1));
            let response = await clev.query(input, {cs: contexts[message.channel.id]});
            contexts[message.channel.id] = response.cs;

            if(response.output) {
                message.channel.send(response.output);
                let messageID = await bot.database.logAiConversation(message.author.id, message.guild?message.guild.id:"dm", contextIDs[message.channel.id], message.cleanContent.substring(args[0].length + 1), response.output);
                contextIDs[message.channel.id] = messageID[0];
            }else
                message.replyLang("GENERIC_ERROR");

            message.channel.stopTyping();

        }catch(e){
            message.replyLang("GENERIC_ERROR");
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};