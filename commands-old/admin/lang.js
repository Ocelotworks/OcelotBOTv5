module.exports = {
	id: "lang",
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server){
		recv.sendMessage({
			to: channel,
			message: await bot.lang.getTranslation(server, args[2])
		});
	}
};