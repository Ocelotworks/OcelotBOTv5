module.exports = {
    name: "1984 Meme",
    usage: "1984 <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["1984", "984"],
    rateLimit: 10,
    categories: ["memes"],
    slashOptions: [{type: "STRING", name: "input", description: "The contents of the speech bubble", required: true}],
    run: function (message, args, bot) {
        if (!args[1])
            return message.replyLang("IMAGE_NO_TEXT");
        return bot.util.imageProcessor(message, getTemplate(message.cleanContent.substring(args[0].length),), "shy")
    },
    runSlash: function(interaction, bot){
        return bot.util.slashImageProcessor(interaction, getTemplate(interaction.options.get("input").value), "shy")
    }
};

function getTemplate(content){
    return {
        "components": [
            {
                "url": "1984.png",
                "local": true,
                "filter": [{
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 25,
                        colour: "#000000",
                        content,
                        x: 210,
                        y: 69,
                        ax: 0.5,
                        ay: 0.5,
                        w: 311,
                        spacing: 1.1,
                        align: 1,
                    }
                }]
            },
        ]
    }
}