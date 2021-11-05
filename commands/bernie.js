const Image = require("../util/Image");
module.exports = {
    name: "Bernie Meme",
    usage: "bernie :input+",
    rateLimit: 10,
    detailedHelp: "Bernie Sanders shows you some text.",
    usageExample: "bernie I am not related to colonel sanders",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bernie", "sanders"],
    run: function (context, bot) {
        return Image.ImageProcessor(bot, context, {
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
                            content: context.options.input,
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
                }
            ],
            "width": 764,
            "height": 500
        }, "bernie");
    },
};
