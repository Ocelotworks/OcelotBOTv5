module.exports = {
    name: "Pinocchio Meme",
    usage: "pinocchio <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["pinocchio", "pinnochio", "pinochio"],
    rateLimit: 10,
    categories: ["image", "memes", "nsfw"],
    unwholesome: true,
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("IMAGE_NO_TEXT");
            return;
        }

        return bot.util.imageProcessor(message, {
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
                            content: message.cleanContent.substring(args[0].length),
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