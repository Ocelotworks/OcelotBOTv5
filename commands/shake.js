module.exports = {
    name: "Shake Image",
    usage: "shake <user or url> [2x]",
    rateLimit: 10,
    categories: ["image"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["shake", "shook"],
    run: async function run(message, args, bot) {
        const url = await bot.util.getImage(message, args);
        if (!url) {
            message.replyLang("CRUSH_NO_USER");
            return;
        }
        let shakeAmount = 5;
        for (let i = 0; i < args.length; i++) {
            if (args[i].toLowerCase().endsWith("x")) {
                shakeAmount = 5 * parseInt(args[i])
                break;
            }
        }
        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "filter": [
                        {
                            "name": "animate",
                            "args": {
                                "delay": 2,
                                "frames": [
                                    {"x": -shakeAmount, "y": 0},
                                    {"x": 0, "y": -shakeAmount},
                                    {"x": 0, "y": 0},
                                    {"x": shakeAmount, "y": 0},
                                    {"x": 0, "y": shakeAmount},
                                    {"x": 0, "y": 0}
                                ]
                            }
                        }
                    ]
                }
            ]
        }, 'shake')
    }
};


