module.exports = {
    name: "Crush",
    usage: "crush <user or url>",
    rateLimit: 10,
    categories: ["image", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["crush"],
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
                    "pos": {"x": 106, "y": 436, "w": 453, "h": 447},
                    "rot": -0.087441,
                    "filter": []
                },
                {
                    "url": "crush.png",
                    "local": true,
                    "pos": {"x": 0, "y": 0},
                    "rot": 0,
                    "filter": []
                }
            ],
            "width": 600,
            "height": 875
        }, 'crush.png')
    }
};


