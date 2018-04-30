/**
 * Created by Peter on 18/10/2017.
 */
const compliments = require('config').get("Commands.compliment.compliments");
module.exports = {
	name: "Compliment",
	usage: "compliment <person>",
	accessLevel: 0,
	commands: ["compliment", "complement", "complament"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!args[1]){
			recv.sendMessage({
				to: channel,
				message: ":bangbang: "+await bot.lang.getTranslation(server, "INVALID_USAGE")+" !compliment <person>"
			})
		}else{
			if(args[1].toLowerCase() === "ocelotbot" || args[1].indexOf("146293573422284800") > -1){
				recv.sendMessage({
					to: channel,
					message: await bot.lang.getTranslation(server, "COMPLIMENT_SELF_COMPLIMENT")
				});
			}else{
				recv.sendMessage({
					to: channel,
					message: `${message.substring(args[0].length+1)}, ${bot.util.arrayRand(compliments)}`
				});
			}
		}

	}
};