/**
 * Created by Peter on 22/12/2017.
 */
const gm = require('gm');
const wrap = require('word-wrap');
module.exports = {
	name: "Shy Meme",
	usage: "shy <text>",
	accessLevel: 0,
	commands: ["shy", "cumed", "clumsy"],
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
			recv.sendMessage({
				to: channel,
				message: "Usage: !shy <text>"
			});
		}

		function draw(text){
			gm("static/shy.png")
				.font("static/arial.ttf", 23)
				.drawText(30, 545, wrap(text, {width: 15, indent: ''}))
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
							filename: "shy.png",
							filetype: "png"
						});
					}
				});
		}
	}
};