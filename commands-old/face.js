/**
 * Created by Peter on 18/07/2017.
 */

const request = require('request');
const config = require('config');
module.exports = {
    name: "Face Recognition",
    usage: "face [url] or embed",
    accessLevel: 0,
    commands: ["face", "age"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        recv.simulateTyping(channel);

        if(event.d.attachments[0]){
            identify(event.d.attachments[0].url);
        }else if(args[1] && args[1].startsWith("http")){
            identify(args[1]);
        }else{
            recv.getMessages({
                channelID: channel,
                limit: 100
            }, async function(err, resp){
                for(var i = resp.length-1; i >= 0; i--){
                    var message = resp[i];
                    if(message.attachments[0] && message.attachments[0].url){
                        identify(message.attachments[0].url);
                        return;
                    }
                }
                recv.sendMessage({
                    to: channel,
                    message: await bot.lang.getTranslation(server, "FACE_NO_IMAGE")
                });
            });
        }


    }
};