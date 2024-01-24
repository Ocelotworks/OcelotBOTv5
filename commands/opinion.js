const Strings = require("../util/String");
const contexts = {};
module.exports = {
    name: "Opinion on",
    usage: "opinion :person+",
    categories: ["fun", "nsfw"],
    rateLimit: 2,
    commands: ["opinion"],
    nsfw: true,
    handleError: function(context){
        return context.sendLang("OPINION_HELP");
    },
    run: async function run(context, bot) {
        let input = Strings.Truncate(context.options.message, 500);

        await context.defer();
        if(input === "clear context"){
            context.send("Context cleared");
            contexts[context.channel.id] = [];
            return
        }

        let prompt = context.getSetting("opinion.prompt");
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

        if(context.interaction){
            content = `> ${Strings.Truncate(context.options.message, 500)}\n<:ocelotbot:914579250202419281> `+content;
        }

        return context.reply({content});

    },
};