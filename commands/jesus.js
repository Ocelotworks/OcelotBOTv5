module.exports = {
    name: "Jesus Meme",
    usage: "jesus <text>",
    rateLimit: 10,
    detailedHelp: "Jesus knows the truth",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jesus", "truth"],
    categories: ["memes"],
    run: function (message, args, bot) {
        if (!args[1]) {
            message.replyLang("IMAGE_NO_TEXT");
            return;
        }
        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": "jesus.png",
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
                            x: 171,
                            y: 146,
                            ax: 0.5,
                            ay: 0.5,
                            w: 150,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "jesus")
    }
};