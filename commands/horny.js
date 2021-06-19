module.exports = {
    name: "Horny License",
    usage: "horny <user or url>",
    rateLimit: 10,
    detailedHelp: "License to be Horny",
    categories: ["memes"],
    requiredPermissions: ["ATTACH_FILES"],
    unwholesome: true,
    commands: ["horny"],
    run: async function run(message, args, bot) {
        const url = await bot.util.getImage(message, args);
        if (!url) {
            message.replyLang("CRUSH_NO_USER");
            return;
        }
        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "pos": {"x": 35, "y": 220, "w": 228, "h": 230},
                    "rot": -0.43057273,
                    "background": "#000000",
                },
                {
                    "url": "horny.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 630,
            "height": 579
        }, "horny")
    }
};


