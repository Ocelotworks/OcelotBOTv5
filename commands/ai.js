/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const Cleverbot = require('cleverbot');
const request = require('request');

const axios = require('axios');
let contexts = {};

let contextIDs = {};

let clev = new Cleverbot({
    key: config.get("key")
});

let commentIndex = 0;
let comments = [];
let titles = [];
let titleIndex = 0;
let failureTimes = 1;
module.exports = {
    name: "Artificial Intelligence",
    usage: "ai <message>",
    detailedHelp: "Ask a question to the Artificial Intelligence",
    usageExample: "ai what is the meaning of life?",
    responseExample: "42.",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai","cleverbot"],
    downloadTitles: function downloadComments(bot){
        bot.logger.log("Downloading AI Titles...");
        request({
            url: 'https://json.reddit.com/r/askreddit/new',
            headers: {
                'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
            }
        }, function processCommentResponse(err, resp, body) {
            if(err) {
                bot.logger.log(err);
                const timeout = 1000*(failureTimes++);
                bot.logger.log(`Trying again in ${timeout}ms`);
                setTimeout(module.exports.downloadTitles, timeout, bot);
            } else {
                try {
                    const data = JSON.parse(body);
                    titles = data.data.children;
                    titleIndex = 0;
                    bot.logger.log("Downloaded "+comments.length+" comments");
                } catch(e) {
                    bot.raven.captureException(e);
                    bot.logger.log(e);
                    const timeout = 1000*(failureTimes++);
                    bot.logger.log(`Trying again in ${timeout}ms`);
                    setTimeout(module.exports.downloadTitles, timeout, bot);
                }
            }
        });

    },
    downloadComments: function downloadComments(bot){
        bot.logger.log("Downloading AI Comments...");
        request({
            url: 'https://json.reddit.com/r/askreddit/comments',
            headers: {
                'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
            }
        }, function processCommentResponse(err, resp, body) {
            if(err) {
                bot.logger.log(err);
                const timeout = 1000*(failureTimes++);
                bot.logger.log(`Trying again in ${timeout}ms`);
                setTimeout(module.exports.downloadComments, timeout, bot);
            } else {
                try {
                    const data = JSON.parse(body);
                    comments = data.data.children;
                    commentIndex = 0;
                    bot.logger.log("Downloaded "+comments.length+" comments");
                } catch(e) {
                    bot.raven.captureException(e);
                    bot.logger.log(e);
                    const timeout = 1000*(failureTimes++);
                    bot.logger.log(`Trying again in ${timeout}ms`);
                    setTimeout(module.exports.downloadComments, timeout, bot);
                }
            }
        });

    },
    init(bot){
        module.exports.downloadComments(bot)
        module.exports.downloadTitles(bot)
    },
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");

        try {
            let input = message.cleanContent.substring(args[0].length + 1);
            if(message.getBool("ai.gpt")){
                let gptResult = await bot.redis.cache(`ai/gpt/${input}`, async () =>(await axios.post(`https://api.openai.com/v1/engines/${message.getSetting("ai.engine")}/completions`, {
                    prompt: "You: "+input+"\nOcelotBOT:",
                    temperature: 0.3,
                    max_tokens: 60,
                    top_p: 0.3,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.0,
                    stop: ["You:","\n","OcelotBOT:"]
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer "+config.get("gpt"),
                    }
                })).data)
                if(gptResult.choices && gptResult.choices[0]){
                    return message.channel.send(gptResult.choices[0].text.trim())
                }else{
                    console.log(gptResult);
                    message.replyLang("GENERIC_ERROR");
                }
            }else {
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

        }catch(e){
            console.log(e);
            let output;
            if(Math.random() > 0.8) {
                output = titles[titleIndex++].data.title.replace(/[\[(].*[\])]/gi, "").replace(/reddit/gi, "Discord");
                if (titleIndex >= titles.length - 10)
                    module.exports.downloadTitles(bot);
            }else {
                output = comments[commentIndex++].data.body.replace(/[\[(].*[\])]/gi, "").replace(/reddit/gi, "Discord");
                if (commentIndex >= comments.length - 10)
                    module.exports.downloadComments(bot);
            }
            message.channel.send(output);
            message.channel.stopTyping();
        }
    }
};