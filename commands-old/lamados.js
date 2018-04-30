const fs = require('fs');
module.exports = {
	name: "Sad Counter",
	usage: "lamados",
	accessLevel: 0,
	commands: ["lamados", "sad"],
	run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		fs.readFile("./lamados.txt", function(err, data){
			if(err){
				bot.raven.captureException(err);
				recv.sendMessage({
					to: channel,
					message: "Error opening lamados file."
				});
			}else{
				recv.sendMessage({
					to: channel,
					message: `Lamados has said "sad" **${data}** times.`
				});
			}
		});
	}
};