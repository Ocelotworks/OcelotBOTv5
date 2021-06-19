
module.exports = {
    name: "Monochrome Image",
    usage: "monochrome [url]",
    rateLimit: 10,
    categories: ["image", "filter"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["monochrome", "blackandwhite", "greyscale"],
    run: async function(message, args, bot){
        const url = await bot.util.getImage(message, args);
        if(!url){
            return message.replyLang("CRUSH_NO_USER");
        }
        return Image.ImageProcessor(bot, context,  {
            "components": [
                {
                    "url": url,
                    "filter": [{name: "greyscale"}],
                },
            ],
        }, 'greyscale')
    }
};