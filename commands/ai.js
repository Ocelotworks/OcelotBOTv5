/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config')
const Cleverbot = require('cleverbot');

let contexts = {};

let contextIDs = {};

let clev = new Cleverbot({
    key: config.get("API.cleverbot.key")
});

const genericResponses = ["huh?", "huh", "what?", "idk", "wdym", "what do you mean?", "i don't get it"];

module.exports = {
    name: "Artificial Intelligence",
    usage: "ai :message+",
    detailedHelp: "Ask a question to the Artificial Intelligence",
    usageExample: "ai what is the meaning of life?",
    responseExample: "42.",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai", "cleverbot"],
    run: async function run(context, bot) {
        let input = context.options.message;
        try {
            context.defer();
            let response = await bot.redis.cache(`ai/${input}`, async () => await clev.query(encodeURIComponent(input), {cs: contexts[context.channel.id]}), 3600);
            contexts[context.channel.id] = response.cs;

            if (response.output) {
                let messageID = await bot.database.logAiConversation(context.user.id, context.guild ? context.guild.id : "dm", contextIDs[context.channel.id], input, response.output);
                contextIDs[context.channel.id] = messageID[0];
                return context.reply(response.output);
            }
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        } catch (e) {
            console.log(e);
            let fakeResponse = await bot.database.getAiResponse(input);
            if(fakeResponse)
                return context.reply(fakeResponse);
            return context.reply(bot.util.arrayRand(genericResponses));
        }
    }
};