module.exports = {
    name: "Bulge Image",
    usage: "bulge [url]",
    categories: ["image", "filter"],
    rateLimit: 10,
    detailedHelp: "Make an image bulge in the middle.",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bulge", "explode", "buldge"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "implode", [message.getSetting("bulge.amount")]);
    }
};