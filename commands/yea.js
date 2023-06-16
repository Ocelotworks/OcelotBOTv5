const Image = require('../util/Image');
module.exports = {
    name: "Yea Meme",
    usage: "yea :input+",
    rateLimit: 10,
    detailedHelp: "When someone says something that makes you go ....yea",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["yea", "yeah"],
    categories: ["memes"],
    contextMenu: {
        type: "text",
        value: "input",
    },
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: function(context, bot){
        const content = context.options.input;
        if(!content || content.length === 0)
            return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
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