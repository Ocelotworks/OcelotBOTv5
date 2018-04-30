/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
	name: "Coin Flip",
	usage: "flip",
	accessLevel: 0,
	commands: ["flip"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		recv.sendMessage({
			to: channel,
			message: await bot.lang.getTranslation(server, "FLIP_"+(Math.random() > 0.5 ? "HEADS" : "TAILS"))
		});
	}
};