
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
    }
};