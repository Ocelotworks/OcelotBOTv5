module.exports = {
    name: "Lisa Meme",
    usage: "lisa <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["lisa"],
    categories: ["image", "memes"],
    run:  function(message, args, bot){
        if(!args[1])
            return message.replyLang("IMAGE_NO_TEXT");

        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": "lisa.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            fontSize: 25,
                            colour: "#000000",
                            content: message.cleanContent.substring(args[0].length),
                            x: 334,
                            y: 197,
                            ax: 0.5,
                            ay: 0.5,
                            w: 424,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "lisa")
    }
};