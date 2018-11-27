
/**
 * Ported by Neil - 30/08/18
 */
 module.exports = {
    name: "Last Crash",
    usage: "lastcrash",
    commands: ["lastcrash","uptime"],
     categories: ["meta"],
    run: function run(message, args, bot) {
       message.replyLang("LASTCRASH", {time: bot.util.prettySeconds(process.uptime())});
    },
    test: function(test){
       test('lastcrash', function(t){
           const message = {
               replyLang: function(message, term){
                   t.is(message, "LASTCRASH");
               }
           };
           const bot = {
               util: {
                   prettySeconds: function(seconds){
                       t.pass();
                   }
               }
           };
           module.exports.run(message, null, bot);
       });
    }
};