const fs = require('fs');
module.exports = {
    name: "Admin",
    usage: "admin",
    detailedHelp: "Can only be used by Bot Admins.",
    categories: ["tools"],
    commands: ["admin", "adm", "mgt"],
    hidden: true,
    init: function init(bot) {
        bot.logger.log("Loading admin commands...");
        bot.util.standardNestedCommandInit("admin");
    },
    run: function (message, args, bot) {
        if (!message.getBool("admin")) return;
        bot.util.standardNestedCommand(message, args, bot, "admin");
    },
    subCommands: {}
};