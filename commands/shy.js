const Image = require('../util/Image');
module.exports = {
    name: "Shy Meme",
    usage: "shy :text+",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["shy"],
    rateLimit: 10,
    categories: ["memes"],
    slashCategory: "images",
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: function (context, bot) {
        return Image.ImageProcessor(bot, context,{
            "components": [
                {
                    "url": "shy.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: context.options.text,
                            x: 105,
                            y: 569,
                            ax: 0.5,
                            ay: 0.5,
                            w: 205,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "shy")
    }
};