module.exports = {
    name: "Wave Image",
    usage: "wave [url]",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["wave", "wavey", "waves"],
    categories: ["image", "filter"],
    run: async function (message, args, bot) {
        return bot.util.processImageFilter(module, message, args, "wave", [10, 50]);
    }
};