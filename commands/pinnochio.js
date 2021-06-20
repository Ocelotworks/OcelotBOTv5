const Image = require('../util/Image');
module.exports = {
    name: "Pinocchio Meme",
    usage: "pinocchio :text+",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["pinocchio", "pinnochio", "pinochio"],
    rateLimit: 10,
    categories: ["memes", "nsfw"],
    unwholesome: true,
    run:  function(context, bot){

        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": "pinnochio.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: context.options.text,
                            x: 114,
                            y: 431,
                            ax: 0.5,
                            ay: 0.5,
                            w: 178,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "pinocchio")
    }
};