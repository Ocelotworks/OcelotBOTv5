module.exports = {
	id: "reloadLang",
	run: function run(user, userID, channel, message, args, event, bot, recv){
		recv.sendMessage({
			to: channel,
			message: "Reloading language cache."
		});
		bot.lang.loadLanguages();
	}
};
