module.exports = {
	id: "clearCache",
	run: function run(user, userID, channel, message, args, event, bot, recv){
		if(!args[2]){
			bot.channelCache = {};
			bot.serverCache = {};
			bot.lang.languageCache = {};
			bot.prefixCache = {};
			bot.banCache = {};
			recv.sendMessage({
				to: channel,
				message: "Cleared ALL Caches on ocelotbot-"+bot.instance
			});
		}else{
			switch(args[2]){
				case "channel":
					recv.sendMessage({
						to: channel,
						message: `Removed ${Object.keys(bot.channelCache).length} items from channel cache on ocelotbot-${bot.instance}`
					});
					bot.channelCache = {};
					break;
				case "server":
					recv.sendMessage({
						to: channel,
						message: `Removed ${Object.keys(bot.serverCache).length} items from server cache on ocelotbot-${bot.instance}`
					});
					bot.serverCache = {};
					break;
				case "prefix":
					recv.sendMessage({
						to: channel,
						message: `Removed ${Object.keys(bot.prefixCache).length} items from prefix cache on ocelotbot-${bot.instance}`
					});
					bot.prefixCache = {};
					break;
				case "ban":
					recv.sendMessage({
						to: channel,
						message: `Removed ${Object.keys(bot.banCache).length} items from ban cache on ocelotbot-${bot.instance}.\nNOTE: This means that NO BANS will be effective until redeploy of this instance.`
					});
					bot.banCache = {};
					break;
				case "language":
				case "lang":
					recv.sendMessage({
						to: channel,
						message: `Removed ${Object.keys(bot.lang.languageCache).length} items from prefix cache on ocelotbot-${bot.instance}`
					});
					bot.lang.languageCache = {};
					break;
				default:
					recv.sendMessage({
						to: channel,
						message: "Invalid cache. Available: ban prefix server channel lang"
					});
					break;
			}
		}
	}
};
