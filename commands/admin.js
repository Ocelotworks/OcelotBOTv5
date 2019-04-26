const fs = require('fs');
module.exports = {
    name: "Admin",
    usage: "admin",
    detailedHelp: "Can only be used by Bot Admins.",
    categories: ["tools"],
    commands: ["admin", "adm", "mgt"],
    hidden: true,
    init: function init(bot){
        bot.logger.log("Loading admin commands...");
        bot.util.standardNestedCommandInit("admin");
    },
    run: function(message, args, bot){
        if(bot.admins.indexOf(message.author.id) === -1)return;
        bot.util.standardNestedCommand(message, args, bot, "admin");
    },
    test: function(test){
        test('admin not admin', function(t){
             const bot = {
                 admins: ["abc"]
             };
             const message = {
                 author: {
                     id: "def"
                 },
                 channel: {
                     send: function(){
                         t.fail();
                     }
                 }
             };
             module.exports.run(message, [], bot);
             t.pass();
        });
    },
    subCommands: {}
};