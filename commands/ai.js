/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const Cleverbot = require('cleverbot');

const axios = require('axios');
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
    responseExample: "42.",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai", "cleverbot"],
    run: async function run(message, args, bot) {
        if (args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");

        try {
            let input = message.cleanContent.substring(args[0].length + 1);
            if (message.getBool("ai.gpt")) {
                if (input.lastIndexOf("\n") > -1)
                    input = input.substring(input.lastIndexOf("\n"))
                let gptResult = await bot.redis.cache(`ai/gpt/${input}`, async () => (await axios.post(`https://api.openai.com/v1/engines/${message.getSetting("ai.engine")}/completions`, {
                    prompt: `OcelotBOT is a chat bot.\n${contexts[message.channel.id] || ""}${message.author.username}: ${input}\nOcelotBOT:`,
                    temperature: 0.7,
                    max_tokens: 60,
                    top_p: 0.3,
                    frequency_penalty: 0.7,
                    presence_penalty: 0.8,
                    stop: [message.author.username + ":", "\n"]
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + config.get("gpt"),
                    }
                })).data)
                if (gptResult.choices && gptResult.choices[0]) {
                    let result = gptResult.choices[0].text.trim();
                    if (result.length == 0)
                        result = "[No Response]";
                    else if (result.toLowerCase().indexOf("don't know") === -1 && result.toLowerCase().indexOf("not sure") > -1 && result.toLowerCase().indexOf("don't understand") > -1)
                        contexts[message.channel.id] = `${message.author.username}: ${input}\nOcelotBOT: ${result}\n`;
                    else
                        contexts[message.channel.id] = null;
                    return message.channel.send(result);
                } else {
                    console.log(gptResult);
                    message.replyLang("GENERIC_ERROR");
                }
            } else {
                message.channel.startTyping();
                let response = await bot.redis.cache(`ai/${input}`, async () => await clev.query(encodeURIComponent(input), {cs: contexts[message.channel.id]}), 3600);
                contexts[message.channel.id] = response.cs;

                if (response.output) {
                    message.channel.send(response.output);
                    let messageID = await bot.database.logAiConversation(message.author.id, message.guild ? message.guild.id : "dm", contextIDs[message.channel.id], message.cleanContent.substring(args[0].length + 1), response.output);
                    contextIDs[message.channel.id] = messageID[0];
                } else {
                    message.replyLang("GENERIC_ERROR");
                }
            }
            message.channel.stopTyping();

        } catch (e) {
            console.log(e);
            message.replyLang("GENERIC_ERROR");
            message.channel.stopTyping();
        }
    }
};