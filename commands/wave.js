module.exports = {
    name: "Wave Image",
    usage: "wave [url]",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["wave", "wavey", "waves"],
    categories: ["image"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "wave", [10, 50]);
    }
};