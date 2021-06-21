const Image = require('../util/Image');
module.exports = {
    name: "Wave Image",
    usage: "wave :image?",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["wave", "wavey", "waves"],
    categories: ["image", "filter"],
    slashHidden: true,
    run: async function (context, bot) {
        return Image.ImageFilter(bot, module.exports.usage, context, "wave", [10, 50]);
    }
};