const Image = require('../util/Image');
module.exports = {
    name: "Yea Meme",
    usage: "yea :input+",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["yea", "yeah"],
    categories: ["memes"],
    contextMenu: {
        type: "text",
        value: "input",
    },
    handleError: function(context){
        return context.sendLang("GENERIC_TEXT");
    },
    run:  function(context, bot){
        const content = context.options.input;
        return Image.ImageProcessor(bot, context, {
            "components": [
                {
                    "url": "yea.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            fontSize: content.length < 90 ? 25 : content.length < 200 ? 15 : 10,
                            colour: "#000000",
                            content,
                            x: 490,
                            y: 96,
                            ax: 0.5,
                            ay: 0.5,
                            w: 260,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "yea")
    }
};