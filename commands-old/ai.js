/**
 * Created by Peter on 08/10/2017.
 */
const request = require('request');
module.exports = {
	name: "Ask Artificial Intelligence",
	usage: "ai <question>",
	accessLevel: 0,
	commands: ["ai", "askai", "reply"],
	run: function run(user, userID, channel, message, args, event, bot, recv, debug, server){
		if(!args[1]){
			recv.sendMessage({
				to: channel,
				message: `Ask me a question: ${args[0]} <question>`
			})
		}else{
			recv.simulateTyping(channel);
			request({
				url: 'https://www.reddit.com/r/gonewild/comments.json',
				headers: {
					'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
				}
			}, function(err, resp, body) {
				if(err) {
					bot.logger.log(err);
				} else {
					try {
						var data = JSON.parse(body);
						if(data && data.data && data.data.children && data.data.children.length > 1) {
							recv.sendMessage({
								to: channel,
								message: data.data.children[parseInt(Math.random() * data.data.children.length)].data.body
							});
						}
					} catch(e) {
						bot.raven.captureException(e);
						bot.logger.log(e);
					}
				}
			});
		}

	}
};