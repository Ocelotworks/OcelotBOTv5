const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Shake Image",
    usage: "shake :0times? :image?",
    rateLimit: 10,
    categories: ["image"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["shake", "shook"],
    run: async function run(context, bot) {
        const url = await Util.GetImage(bot, context);
        if (!url)
            return context.sendLang({content: "CRUSH_NO_USER", ephemeral: true});

        let shakeAmount = context.options.times || 5;
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


