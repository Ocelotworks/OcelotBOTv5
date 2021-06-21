const Image = require('../util/Image');
module.exports = {
    name: "Bulge Image",
    usage: "bulge :image?",
    categories: ["image", "filter"],
    rateLimit: 10,
    detailedHelp: "Make an image bulge in the middle.",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bulge", "explode", "buldge"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context, "implode", [message.getSetting("bulge.amount")]);
    }
};