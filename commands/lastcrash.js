
/**
 * Ported by Neil - 30/08/18
 */
const request = require('request')
 module.exports = {
    name: "Last Crash",
    usage: "lastcrash",
    commands: ["lastcrash","uptime"],
     categories: ["meta"],
    run: function run(message, args, bot) {

        request("http://localhost:3006/lastcrash", function(err, resp, body){
            if(err)
                return message.replyLang("GENERIC_ERROR");
            console.log(body);
            message.replyLang("LASTCRASH", {time: bot.util.prettySeconds((new Date().getTime()-parseInt(body))/1000)});
        });


    }
};