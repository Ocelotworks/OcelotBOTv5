/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/08/2019
 * ╚════ ║   (ocelotbotv5) overlay
 *  ════╝
 */
module.exports = {
    name: "Overlay Images",
    usage: "overlay <image1> <image2>",
    categories: ["fun", "image"],
    rateLimit: 100,
    commands: ["overlay", "combine"],
    run: async function run(message, args, bot) {
        let url1 = await bot.util.getImage(message,  args, 1);
        let url2 = await bot.util.getImage(message,  args, 2);
        if(!url1 || !url2)
            return message.channel.send("You must enter 2 images.");

        if(!args[2]){
            const tempUrl1 = url1;
            url1 = url2;
            url2 = tempUrl1;
        }

        return bot.util.imageProcessor(message, {
            "components": [{
                "url": url1,
            }, {
                "url": url2,
                "pos": {"w": "100%", "h": "100%"},
            }],
        }, 'overlay')
    },
};