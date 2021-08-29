const Image = require('../util/Image');
module.exports = {
    name: "Jesus Meme",
    usage: "jesus :text+",
    rateLimit: 10,
    detailedHelp: "Jesus knows the truth",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jesus", "truth"],
    categories: ["memes"],
    slashCategory: "images",
    handleError: function(context){
        return context.sendLang("GENERIC_TEXT");
    },
    run: function (context, bot) {
        return Image.ImageProcessor(bot, context,{
            "components": [
                {
                    "url": "jesus.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: context.options.text,
                            x: 171,
                            y: 146,
                            ax: 0.5,
                            ay: 0.5,
                            w: 150,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "jesus")
    }
};