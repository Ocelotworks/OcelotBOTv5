/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config')
const Cleverbot = require('cleverbot');
const { Configuration, OpenAIApi } = require("openai");
const Util = require("../util/Util");
const Strings = require("../util/String");
const configuration = new Configuration({
    apiKey: Util.GetSecretSync("OPENAI_API_KEY"),
});
const api = new OpenAIApi(configuration)

let contexts = {};

let contextIDs = {};

let clev = new Cleverbot({
    key: config.get("API.cleverbot.key")
});

const genericResponses = ["huh?", "huh", "what?", "idk", "wdym", "what do you mean?", "i don't get it", "what are you talking about?", "I have no idea what you're talking about", "what??"];

module.exports = {
    name: "Artificial Intelligence",
    usage: "ai :message+",
    detailedHelp: "Ask a question to the Artificial Intelligence",
    usageExample: "ai what is the meaning of life?",
    responseExample: "42.",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai", "cleverbot"],
    handleError: function(context){
        return context.sendLang("8BALL_NO_QUESTION");
    },
    run: async function run(context, bot) {
        let input = context.options.message;

        if(!context.getBool("ai.gpt")){
            await context.defer();
            let response = await api.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: "system", content: Strings.Format(context.getSetting("ai.prompt"), {userName: context.user.username, ownerName: bot.lang.ownerTag, botName: bot.client.user.username})},
                    ...(contexts[context.channel.id] || []),
                    {role: "user", content: input},
                ]
            });
            contexts[context.channel.id] = [{role: "user", content: input}, {role: "assistant", content: response.data.choices[0].message.content}];
            let content = response.data.choices[0].message.content;
            if(context.interaction){
                content = `> ${context.options.message}\n<:ocelotbot:914579250202419281> `+content;
            }
            return context.send({content});
        }

        try {
            await context.defer();
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