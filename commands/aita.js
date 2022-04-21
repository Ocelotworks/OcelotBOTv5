const {axios} = require('../util/Http');
const Embeds = require("../util/Embeds");
module.exports = {
    name: "Am I The Asshole?",
    usage: "aita :question+",
    detailedHelp: "Get some perspective on a problem",
    usageExample: "aiti if I steal my co-workers cheese?",
    responseExample: "YTA. They just want their cheese.",
    categories: ["fun"],
    commands: ["aita", "amitheasshole"],
    argDescriptions: {question: {name: "A situation to get perspectives on"}},
    handleError: function(context){
      return context.sendLang("8BALL_NO_QUESTION");
    },
    run: async function run(context, bot) {
        await context.defer();
        let result = await axios.post("https://areyoutheasshole.com/api/generate", {text: context.options.question}, {validateStatus: ()=>true});
        if(!result?.data)
            return context.sendLang({content: "DELPHI_UNANSWERABLE"});

        let neutEmbed = new Embeds.LangEmbed(context);
        neutEmbed.setTitle("Neutral");
        neutEmbed.setDescription(result.data.neutResponse);
        neutEmbed.setColor("#a1a1a1");

        let ytaEmbed = new Embeds.LangEmbed(context);
        ytaEmbed.setTitle("YTA");
        ytaEmbed.setDescription(result.data.yataResponse);
        ytaEmbed.setColor("#aa2222");

        let ntaEmbed = new Embeds.LangEmbed(context);
        ntaEmbed.setTitle("NTA");
        ntaEmbed.setDescription(result.data.ntaResponse);
        ntaEmbed.setColor("#22aa22");

        const embeds = [neutEmbed, ytaEmbed, ntaEmbed];
        bot.util.shuffle(embeds)

        return context.send({embeds})


    }
};