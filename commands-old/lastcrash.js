/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Last Crash",
    usage: "lastcrash",
    accessLevel: 0,
    commands: ["lastcrash", "uptime"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        // var now = new Date().getTime();
        //
        // var timeDiff = Math.abs(now - bot.lastCrash.getTime())/1000;


        recv.getStats(async function(stats){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "LASTCRASH", {time: bot.util.prettySeconds(stats.uptime)})
            });
        });
        // recv.sendMessage({
        //     to: channel,
        //     message: `The last crash was **${bot.util.prettySeconds(timeDiff)}** ago. (${bot.lastCrash.getDate()}/${bot.lastCrash.getMonth()+1}/${bot.lastCrash.getFullYear()})`
        // });

    }
};