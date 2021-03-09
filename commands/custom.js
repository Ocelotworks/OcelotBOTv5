module.exports = {
    name: "Custom Functions",
    usage: "custom add/list",
    rateLimit: 10,
    detailedHelp: "Add custom commands or autoresponders",
    categories: ["meta"],
    commands: ["custom"],
    premium: true,
    hidden: true,
    init: function init(bot) {
        bot.util.standardNestedCommandInit("custom");
    },
    run: function run(message, args, bot) {
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You must have the Manage Server permission to use this command.");
        bot.util.standardNestedCommand(message, args, bot, "custom");
    },
};