module.exports = {
    name: "Yea Meme",
    usage: "yea <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["yea", "yeah"],
    categories: ["memes"],
    run:  function(message, args, bot){
        if(!args[1])
            return message.replyLang("IMAGE_NO_TEXT");

        const content = message.cleanContent.substring(args[0].length);

        return bot.util.imageProcessor(message, {
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
        }, "lisa")
    }
};