const Image = require('../util/Image');
module.exports = {
    name: "Strong Opinions Meme",
    usage: "opinions :text+",
    requiredPermissions: ["ATTACH_FILES"],
    rateLimit: 10,
    commands: ["opinions", "strongopinions"],
    categories: ["memes"],
    unwholesome: true,
    run: function(context, bot){
        return Image.ImageProcessor(bot, context,{
            "components": [
                {
                    "url": "opinions.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 15,
                            colour: "#000000",
                            content: context.options.text,
                            x: 244,
                            y: 66,
                            ax: 0.5,
                            ay: 0.5,
                            w: 67,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "opinions")
    }
};