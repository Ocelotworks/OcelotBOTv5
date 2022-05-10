module.exports = {
    name: "Goblin",
    usage: "goblin",
    detailedHelp: "Goblin.",
    usageExample: "goblin",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["goblin"],
    categories: ["image", "search"],
    run: async function run(context, bot) {
        context.options.text = "goblin";
        return bot.commandObjects["image.js"].run(context, bot);
    }
}