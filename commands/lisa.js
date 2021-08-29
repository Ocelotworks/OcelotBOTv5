const Image = require('../util/Image');
module.exports = {
    name: "Lisa Meme",
    usage: "lisa :input+",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["lisa"],
    categories: ["memes"],
    slashCategory: "images",
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: function(context, bot){
        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    "url": "lisa.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            fontSize: 25,
                            colour: "#000000",
                            content: context.options.input,
                            x: 334,
                            y: 197,
                            ax: 0.5,
                            ay: 0.5,
                            w: 424,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "lisa");
    }
};
