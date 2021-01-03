module.exports = {
    name: "Jesus Meme",
    usage: "jesus <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jesus", "truth"],
    categories: ["image", "fun", "memes"],
    run:  function(message, args, bot){
        if(!args[1]){
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
                    "filter": []
                },
                {
                    "pos": {"x": 109, "y": 111, "w": 119, "h": 82},
                    "rot": 0,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 90,
                            colour: "#000000",
                            content: message.cleanContent.substring(args[0].length),
                            x: 259,
                            y: 261,
                            ax: 0.5,
                            ay: 0.5,
                            w: 318,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                }
            ],
            "width": 500,
            "height": 566
        }, "jesus")
    }
};