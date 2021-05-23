module.exports = {
    name: "Shy Meme",
    usage: "shy <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["shy"],
    rateLimit: 10,
    categories: ["memes"],
    run: function (message, args, bot) {
        if (!args[1]) {
            message.replyLang("IMAGE_NO_TEXT");
            return;
        }

        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": "shy.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: message.cleanContent.substring(args[0].length),
                            x: 105,
                            y: 569,
                            ax: 0.5,
                            ay: 0.5,
                            w: 205,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "shy")
    }
};