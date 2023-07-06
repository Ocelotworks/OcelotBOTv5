/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config')
const { Configuration, OpenAIApi } = require("openai");
const Util = require("../util/Util");
const Strings = require("../util/String");
const {axios} = require("../util/Http");
const configuration = new Configuration({
    apiKey: Util.GetSecretSync("OPENAI_API_KEY"),
});
const api = new OpenAIApi(configuration)

let contexts = {};

const genericResponses = ["huh?", "huh", "what?", "idk", "wdym", "what do you mean?", "i don't get it", "what are you talking about?", "I have no idea what you're talking about", "what??"];

let responseCount = 0;

const gptCost = 5;

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
        let input = Strings.Truncate(context.options.message, 500);

        await context.defer();

        const isPremium = context.getBool("serverPremium") || context.getBool("premium");
        const canUse = isPremium || await bot.database.takePoints(context.user.id, gptCost, context.commandData.id);

        if(canUse && !context.getBool("ai.gpt")){

            if(input === "clear context"){
                context.send("Context cleared");
                contexts[context.channel.id] = [];
                return
            }

            let prompt = Strings.Format(context.getSetting("ai.prompt"), {userName: context.member?.nickname || context.user.username, ownerName: bot.lang.ownerTag, botName: bot.client.user.username});
            if(context.message?.attachments?.size > 0){
                const attachment = context.message.attachments.first();
                const identifyRequest = await axios.post("https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&details=Celebrities&language=en", {
                    url: attachment.url,
                }, {
                    validateStatus: ()=>true,
                    headers: {
                        "Ocp-Apim-Subscription-Key": config.get("API.msVision.key"),
                    }
                })
                prompt += "You have the ability to see attached images by their contents are described inside square brackets.";
                if(identifyRequest?.data?.description?.captions?.length > 0){
                    input += `
 [An image named '${attachment.name}' is attached which contains: ${identifyRequest.data.description.captions.map((t)=>t.text).join(", ")}]`;
                    console.log(input);
                }else{
                    input += `[An image named '${attachment.name}' is attached]`;
                }
            }

            if(input.toLowerCase().includes("gif"))prompt += " To provide a GIF, use the format @{tenor:<search term>}";
            let response = await api.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: "system", content: prompt},
                    ...(contexts[context.channel.id] || []),
                    {role: "user", content: input},
                ]
            });
            contexts[context.channel.id] = [{role: "user", content: input}, {role: "assistant", content: response.data.choices[0].message.content}];
            let content = Strings.Truncate(response.data.choices[0].message.content, 1400);

            const gif = content.match(/@{tenor:(.*)}/);
            if(gif && gif[1]){
                try {
                    const searchTerm = gif[1];
                    let gifResults = await axios.get(`https://g.tenor.com/v1/search?q=${searchTerm}&key=${config.get("API.tenor.key")}&limit=1`);
                    content = content.replace(gif[0], Util.ArrayRand(gifResults.data.results).url);
                }catch(e){
                    console.error("Failed to get gif", e);
                }
            }

            if(context.interaction){
                content = `> ${Strings.Truncate(context.options.message, 500)}\n<:ocelotbot:914579250202419281> `+content;
            }

            if(!isPremium) {
                let currentPoints = await bot.database.getPoints(context.user.id);
                if (currentPoints < gptCost) {
                    content = Strings.Truncate(content, 1700) + `\n\n<a:points_ending:825704034031501322> To continue using this command, you need ${gptCost - currentPoints} more <:points:817100139603820614> **Points**.\nLearn more with </points earn:904885955423502365>`
                }
            }

            return context.reply({content});
        }

        let fakeResponse = await bot.database.getAiResponse(input);
        if(fakeResponse) {
            // Cheap way of making the message come up only sometimes
            if(responseCount++ % 50 === 0) {
                let currentPoints = await bot.database.getPoints(context.user.id);
                fakeResponse += `\n\nℹ️ You need ${gptCost-currentPoints} more <:points:817100139603820614> **Points** to unlock the full power of the AI. Learn more with </points earn:904885955423502365>`;
            }
            return context.reply(fakeResponse);
        }
        return context.reply(bot.util.arrayRand(genericResponses));
    }
};