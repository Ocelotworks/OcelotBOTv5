/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/08/2019
 * ╚════ ║   (ocelotbotv5) overlay
 *  ════╝
 */
const Image = require('../util/Image');
const Util = require("../util/Util");
module.exports = {
    name: "Overlay Images",
    usage: "overlay :image1? :image2?",
    categories: ["fun", "image"],
    rateLimit: 100,
    commands: ["overlay", "combine"],
    slashCategory: "images",
    run: async function run(context, bot) {
        const url1 = await Util.GetImage(bot, context, "image1", 0);
        const url2 = await Util.GetImage(bot, context, "image2", 1);
        if(!url1 || !url2)
            return context.send({content: "You must enter 2 images.", ephemeral: true});


        return Image.ImageProcessor(bot, context,  {
            "components": [{
                "url": url1,
            }, {
                "url": url2,
                "pos": {"w": "100%", "h": "100%"},
            }],
        }, 'overlay')
    },
};