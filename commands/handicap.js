module.exports = {
    name: "Handicapped Meme",
    usage: "handicap <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["handicap", "handycap", "handicapped"],
    categories: ["image", "memes"],
    unwholesome: true,
    run:  function(message, args, bot){
        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": "handicap.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#000000",
                            content: message.cleanContent.substring(args[0].length),
                            x: 386,
                            y: 341,
                            ax: 0.5,
                            ay: 0.5,
                            w: 209,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ],
            "width": 569,
            "height": 721
        }, "handicap")
    }
};