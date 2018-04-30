/**
 * Created by Peter on 02/07/2017.
 */

const request = require('request');
const svg2png = require('svg2png');
module.exports = {
    name: "Snapcode Generator",
    usage: "snapchat <username>",
    accessLevel: 0,
    commands: ["snapchat", "snapcode"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.attachFiles)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: ":warning: This command requires the permission **Attach Files**"
			});
			return;
		}
        if(!args[1]){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: You must enter a snapchat username. i.e !snapchat unacceptableuse"
            });
        }else{
            recv.simulateTyping(channel);
            request(`https://snapcodes.herokuapp.com/snapcode.php?username=${args[1]}&size=400`, async function(err, resp, body){
                if(!err){
                	try{
						recv.uploadFile({
							to: channel,
							file: await svg2png(new Buffer(body), {width: 400, height: 400}),
							filename: "snapcode.png",
							message: "Here's your snapcode:"
						});
					}catch(err){
						bot.raven.captureException(err);
						recv.sendMessage({
							to: channel,
							message: ":bangbang: An error occurred. Please try again later."
						});
						bot.logger.error(err.stack);
					}

                }else{
					bot.raven.captureException(err);
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: An error occurred. Please try again later."
                    });
                    bot.logger.error(err.stack);
                }
            });
        }

    }
};