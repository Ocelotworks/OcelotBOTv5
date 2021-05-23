module.exports = {
    name: "Strong Opinions Meme",
    usage: "opinions <text>",
    requiredPermissions: ["ATTACH_FILES"],
    rateLimit: 10,
    commands: ["opinions", "strongopinions"],
    categories: ["memes"],
    unwholesome: true,
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("IMAGE_NO_TEXT");
            return;
        }

        return bot.util.imageProcessor(message, {
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
                            content: message.cleanContent.substring(args[0].length),
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