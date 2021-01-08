module.exports = {
    name: "Dictator Meme",
    usage: "dictator <user or url>",
    rateLimit: 10,
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["dictator", "chairman", "mao"],
    run: async function run(message, args, bot){
        const url = await bot.util.getImage(message, args);
        if(!url){
            message.replyLang("CRUSH_NO_USER");
            return;
        }
        return bot.util.imageProcessor(message, {
            "components": [
                {
                    "url": url,
                    "local": false,
                    "pos": {"x": 225, "y": 120, "w": 152, "h": 196},
                    "rot": 0,
                    "filter": [],
                    "background": "#000000"
                },
                {
                    "url": "dictator.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 598,
            "height": 465
        }, 'dictator')
    }
};


