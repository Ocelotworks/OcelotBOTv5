module.exports = {
    name: "Brazzers",
    usage: "brazzers <user or url>",
    rateLimit: 10,
    categories: ["memes", "nsfw"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["brazzers"],
    unwholesome: true,
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
                },
                {
                    "url": "brazzers.png",
                    "local": true,
                    "pos": {"w": "50%", "h": "15%"},
                }
            ],
        }, 'brazzers')
    }
};


