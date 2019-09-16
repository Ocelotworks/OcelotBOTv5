module.exports = {
    name: "Zoom Image",
    usage: "zoom [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["zoom", "blur"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "motion-blur", [message.getSetting("zoom.radius")]);
    }
};