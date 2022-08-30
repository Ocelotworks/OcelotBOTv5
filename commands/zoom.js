const Image = require('../util/Image');
module.exports = {
    name: "Zoom Image",
    usage: "zoom :image?",
    detailedHelp: "Makes the image all speedy-like",
    categories: ["image", "filter"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["zoom", "blur"],
    slashCategory: "filter",
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context,"motionBlur", [context.getSetting("zoom.radius"), context.getSetting("zoom.sigma")] )
    }
};