/**
 * Created by Peter on 13/07/2017.
 */


const config = require('config');
const request = require('request');



const messages = [
    "That looks like ",
    "That appears to be ",
    "Seems like ",
    "Might be ",
    "Could be ",
    "Probably ",
    "Possibly ",
    "I see ",
    "Looks like "
];


const vowels = "aeiou";
module.exports = {
    name: "Identify Image",
    usage: "identify [URL]",
    accessLevel: 0,
    commands: ["identify", "ident"],
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
                for(var i = 0; i < resp.length; i++){
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

        function identify(url){
			request({
				method: 'POST',
				json: true,
				url: "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&details=Celebrities&language=en",
				headers: {
					"Content-Type": "application/json",
					"Ocp-Apim-Subscription-Key": config.get("Commands.identify.key")
				},
				body: {
					url: url
				}
			}, async function(err, resp, body){
				if(debug){
					recv.sendMessage({
						to: channel,
						message: `\`\`\`json\n${JSON.stringify(body, null, 1)}\n\`\`\``
					});
				}
				if(err){
					bot.raven.captureException(err);
				}else if(body && body.description && body.description.captions && body.description.captions.length > 0) {
					recv.sendMessage({
						to: channel,
						message: await bot.lang.getTranslation(server, "IDENTIFY_RESPONSE_"+(parseInt(Math.random()*8)), body.description.captions[0].text)
					});
				}else{
					recv.sendMessage({
						to: channel,
						message: await bot.lang.getTranslation(server, "FACE_NO_FACES")
					});
				}
			})
        }

    }
};