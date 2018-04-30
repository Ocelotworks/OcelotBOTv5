module.exports = {
	id: "reloadConfig",
	run: function run(user, userID, channel, message, args, event, bot, recv){
		delete require.cache[require.resolve('config')];
		recv.sendMessage({
			to: channel,
			message: "Config reloaded. "
		});
	}
};
