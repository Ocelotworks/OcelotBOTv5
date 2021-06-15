module.exports = {
    name: "Bernie Meme",
    usage: "bernie <text>",
    rateLimit: 10,
    usageExample: "bernie I am not related to colonel sanders",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bernie", "sanders"],
    slashOptions: [{type: "STRING", name: "input", description: "What Bernie is saying", required: true}],
    run: function (message, args, bot) {
        if (!args[1])
            return message.replyLang("IMAGE_NO_TEXT");
        return bot.util.imageProcessor(message, getTemplate(message.cleanContent.substring(args[0].length)), "bernie")
    },
    runSlash: function(interaction, bot){
        return bot.util.slashImageProcessor(interaction, getTemplate(interaction.options.get("input").value), "bernie")
    }
};

function getTemplate(content){
    return {
        "components": [
            {
                "pos": {"x": 290, "y": 86, "w": 360, "h": 290},
                "rot": -0.05916666,
                "background": "#ffffff",
                "filter": [{
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 40,
                        colour: "#000000",
                        content: content,
                        x: 20,
                        y: 20,
                        ax: 0,
                        ay: 0,
                        w: 650,
                        spacing: 1.1,
                        align: 0,
                    }
                }]
            },
            {
                "url": "bernie.png",
                "local": true,
                "pos": {"x": 0, "y": 0},
                "rot": 0,
                "filter": []
            }
        ],
        "width": 764,
        "height": 500
    }
}