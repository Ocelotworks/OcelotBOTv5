
module.exports = {
    name: "Points",
    usage: "points",
    categories: ["meta"],
    detailedHelp: "View the amount of points you have",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["points"],
    init: function init(bot){
        bot.util.standardNestedCommandInit("points");
    },
    run: async function(message, args, bot){
        await bot.util.standardNestedCommand(message, args, bot, "points")
    }
};