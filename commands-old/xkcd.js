/**
 * Created by Peter on 06/08/2017.
 */
const request = require('request');
module.exports = {
	name: "xkcd",
	usage: "xkcd [comic]",
	accessLevel: 0,
	commands: ["xkcd", "xckd"],
	run: function run(user, userID, channel, message, args, event, bot, recv, debug, server){
		request(args[1] && parseInt(args[1]) ? `https://xkcd.com/${args[1]}/info.0.json` : "https://xkcd.com/info.0.json", function(err, resp, body){
			if(err){
				recv.sendMessage({
					to: channel,
					message: ":bangbang: Error contacting XKCD. Try Again Later."
				});
				bot.logger.error(err.stack);
			}else{
				try{
					var data = JSON.parse(body);
					recv.sendMessage({
						to: channel,
						message: "",
						embed: {
							title: data.title,
							description: data.alt,
							image: {
								url: data.img
							}
						}
					});
				}catch(e){
					recv.sendMessage({
						to: channel,
						message: ":bangbang: Invalid response from XKCD. Try Again Later."
					});
					bot.logger.error(e.stack);
				}
			}
		});

	}
};