/**
 * Created by Peter on 22/12/2017.
 */
const gm = require('gm');
const wrap = require('word-wrap');
module.exports = {
	name: "Bernie Meme",
	usage: "bernie <text>",
	accessLevel: 0,
	commands: ["bernie", "sanders"],
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
			gm("static/bernie.png")
				.font("static/arial.ttf", 30)
				.drawText(305, 117, wrap(text, {width: 25, indent: ''}))
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
							filename: "bernie.png",
							filetype: "png"
						});
					}
				});
		}
	}
};