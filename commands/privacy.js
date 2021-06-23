module.exports = {
    name: "Privacy",
    usage: "privacy help",
    categories: ["meta"],
    detailedHelp: "Manage what data OcelotBOT has on you",
    commands: ["privacy", "mydata", "gdpr"],
    init: function init(bot){
        bot.util.standardNestedCommandInit("privacy");
    },
    run: async function(context, bot){
        await bot.util.standardNestedCommand(message, args, bot, "privacy")
    }
};