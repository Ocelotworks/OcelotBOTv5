const Image = require('../util/Image');
module.exports = {
    name: "Trade Offer",
    usage: "tradeoffer :input+",
    rateLimit: 10,
    detailedHelp: "I Receive: Votes You Receive: nothing",
    usageExample: "tradeoffer server admin / bans",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["tradeoffer"],
    categories: ["memes"],
    slashOptions: [{type: "STRING", name: "first", description: "I receive:", required: true}, {type: "STRING", name: "second", description: "You receive: (Defaults to nothing)", required: false}],
    handleError: function(context){
        return context.sendLang({content: "TRADEOFFER_INPUT", ephemeral: true});
    },
    run: function (context, bot) {
        const fullText = context.options.input;
        let first = fullText
        let second = "nothing";
        if(fullText.indexOf("/") > -1){
            const split = fullText.split("/");
            first = split[0].trim();
            second = split[1].trim();
        }
        return Image.ImageProcessor(bot, context,  getTemplate(first, second), "tradeoffer")
    },
};

function getTemplate(first, second){
    return {
        "components": [
            {
                "url": "tradeoffer.png",
                "local": true,
                "filter": [{
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 25,
                        colour: "#ffffff",
                        content: first,
                        x: 94,
                        y: 138,
                        ax: 0.5,
                        ay: 0,
                        w: 130,
                        spacing: 1.1,
                        align: 1,
                    }
                }, {
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 25,
                        colour: "#ffffff",
                        content: second,
                        x: 330,
                        y: 138,
                        ax: 0.5,
                        ay: 0,
                        w: 130,
                        spacing: 1.1,
                        align: 1,
                    }
                }]
            },
        ]
    }
}