const {axios} = require('../util/Http');
module.exports = {
    name: "Ask Delphi",
    usage: "delphi :question+",
    detailedHelp: "Ask an ethical question to delphi",
    usageExample: "delphi should I steal?",
    responseExample: "_You should not_",
    categories: ["fun"],
    commands: ["delphi"],
    argDescriptions: {question: "Am ethical question to ask Delphi"},
    handleError: function(context){
      return context.sendLang("8BALL_NO_QUESTION");
    },
    run: async function run(context, bot) {
        await context.defer();
        let result = await axios.get(`https://mosaic-api-frontdoor.apps.allenai.org/predict?action1=${encodeURIComponent(context.options.question)}`);
        if(result?.data?.answer?.text)
            return context.send({content: `> ${context.options.question}\n_${result.data.answer.text}_`});
        bot.logger.log(result?.data);
        return context.send({content: "Couldn't answer that question. Try something else."});
    }
};