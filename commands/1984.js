const Image = require('../util/Image');
module.exports = {
    name: "1984 Meme",
    usage: "1984 :input+",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["1984", "984"],
    rateLimit: 10,
    categories: ["memes"],
    argDescriptions: {input: "The contents of the speech bubble"},
    run: function (context, bot) {
        return Image.ImageProcessor(bot, context, {
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
                            content: context.options.input,
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
        }, "shy");
    },
};
