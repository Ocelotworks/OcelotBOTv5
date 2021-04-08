module.exports = {
    name: "Trade Offer",
    usage: "tradeoffer <text> / <text>",
    rateLimit: 10,
    detailedHelp: "I Receive: Votes You Receive: nothing",
    usageExample: "tradeoffer server admin / amogus meme",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["tradeoffer"],
    categories: ["image", "memes"],
    run: function (message, args, bot) {
        if (!args[1]) {
            return message.channel.send(`Enter one or two things like: **${args[0]} sloppy toppy** or **${args[0]} admin / nothing**`)
        }
        const fullText = message.cleanContent.substring(args[0].length);
        let first = fullText
        let second = "nothing";
        if(fullText.indexOf("/") > -1){
            const split = fullText.split("/");
            first = split[0].trim();
            second = split[1].trim();
        }
        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": "tradeoffer.png",
                    "local": true,
                    "filter": [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#ffffff",
                            content: first,
                            x: 94,
                            y: 168,
                            ax: 0.5,
                            ay: 0.5,
                            w: 130,
                            spacing: 1.1,
                            align: 1,
                        }
                    }, {
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 25,
                            colour: "#ffffff",
                            content: second,
                            x: 330,
                            y: 168,
                            ax: 0.5,
                            ay: 0.5,
                            w: 130,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                },
            ]
        }, "tradeoffer")
    }
};