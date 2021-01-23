module.exports = {
    name: "Rainbow Image",
    usage: "rainbow <user or url>",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rainbow", "rainbowimage"],
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
                    "filter": [{name: "rainbow"}],
                },
            ],
        }, 'rainbow')
    }
};


