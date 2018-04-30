/**
 * Created by Peter on 11/07/2017.
 */

var targetChannel = null;
var outputChannel = null;

module.exports = {
    name: "Eavesdropper",
    usage: "eavesdrop <channel>",
    accessLevel: 100,
    commands: ["eavesdrop", "listen"],
    hidden: true,
    init: function(bot, cb){
        bot.registerMessageHandler("eavesdropper", function messageHandler(user, userID, channelID, message, event, _bot, receiver){
            if(targetChannel && targetChannel == channelID){
                receiver.sendMessage({
                    to: outputChannel,
                    message: `${user}: ${message}`
                });
            }
        });
        cb();
    },
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        if(userID === "139871249567318017"){
            if(args[1] === "stop"){
                targetChannel = null;
                outputChannel = null;
                recv.sendMessage({
                    to: channel,
                    message: ":spy: Stopped Eavesdropping."
                });
            }else{
                targetChannel = args[1];
                outputChannel = channel;
                recv.sendMessage({
                    to: channel,
                    message: ":spy: Eavesdropping on "+args[1]
                });
            }
        }

    }
};