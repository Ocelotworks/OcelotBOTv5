/**
 * Created by Peter on 09/07/2017.
 */

const gm = require('gm');
const wrap = require('word-wrap');
module.exports = {
    name: "Hanicapped Meme",
    usage: "handicap [text]",
    accessLevel: 0,
    commands: ["handicap", "handicapped"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.attachFiles)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "ERROR_NEEDS_PERMISSION", "Attach Files")
			});
			return;
		}
        recv.simulateTyping(channel);
        if(args[1]) {
           draw(message.substring(args[0].length));
        }else{
            recv.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
                if(err)bot.raven.captureException(err);
                draw(err || resp[1].content);
            });
        }

        function draw(text){
            gm("static/handicap.png")
                .font("static/arial.ttf", 30)
                .drawText(275, 328, wrap(text, {width: 20, indent: ''}))
                .toBuffer('PNG', async function(err, buffer){
                    if(err){
                        recv.sendMessage({
                            to: channel,
                            message:  await bot.lang.getTranslation(server, "GENERIC_ERROR")
                        });
						bot.raven.captureException(err);
                        console.log(err);
                    }else{
                        recv.uploadFile({
                            to: channel,
                            file: buffer,
                            filename: "handicapped.png",
                            filetype: "png"
                        });
                    }
                });
        }
    }
};