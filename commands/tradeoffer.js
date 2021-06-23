module.exports = {
    name: "Trade Offer",
    usage: "tradeoffer <text> / <text>",
    rateLimit: 10,
    detailedHelp: "I Receive: Votes You Receive: nothing",
    usageExample: "tradeoffer server admin / amogus meme",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["tradeoffer"],
    categories: ["memes"],
    slashOptions: [{type: "STRING", name: "first", description: "I receive:", required: true}, {type: "STRING", name: "second", description: "You receive: (Defaults to nothing)", required: false}],
    run: function (message, args, bot) {
        if (!args[1]) {
            return message.channel.send(`Enter one or two things like: **${context.command} sloppy toppy** or **${context.command} admin / nothing**`)
        }
        const fullText = message.cleanContent.substring(context.command.length);
        let first = fullText
        let second = "nothing";
        if(fullText.indexOf("/") > -1){
            const split = fullText.split("/");
            first = split[0].trim();
            second = split[1].trim();
        }
        return Image.ImageProcessor(bot, context,  getTemplate(first, second), "tradeoffer")
    },
    runSlash: function(interaction, bot){
        return bot.util.slashImageProcessor(interaction, getTemplate(interaction.options.get("first").value, interaction.options.has("second") ? interaction.options.get("second").value : "Nothing"), "tradeoffer")
    }
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