const Image = require('../util/Image');
module.exports = {
    name: "Handicapped Meme",
    usage: "handicap :text+",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["handicap", "handycap", "handicapped"],
    categories: ["memes"],
    unwholesome: true,
    run: function(context, bot){
        return Image.ImageProcessor(bot, context,{
            "components": [
                {
                    "url": "handicap.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: context.options.text,
                            x: 386,
                            y: 341,
                            ax: 0.5,
                            ay: 0.5,
                            w: 209,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ],
            "width": 569,
            "height": 721
        }, "handicap");
    }
};