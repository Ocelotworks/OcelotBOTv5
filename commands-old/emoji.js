module.exports = {
	name: "Emoji Lookup",
	usage: "emoji <term>",
	accessLevel: 0,
	commands: ["emoji", "emojilookup", "lookupemoji"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.useExternalEmojis)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "ERROR_NEEDS_PERMISSION", "Use External Emojis")
			});
			return;
		}
		if(args[1]){
			recv.simulateTyping(channel);
			const result = await bot.util.emojiLookup(args[1]);
			if(result.length < 1){
				recv.sendMessage({
					to: channel,
					message: await bot.lang.getTranslation(server, "EMOJI_NOT_FOUND")
				});
			}else{
				var output = bot.util.chunkify(result, 15, false);
				for(var i = 0; i < output.length; i++){
					recv.sendMessage({
						to: channel,
						message: output[i].join(" ")
					});
				}
			}

		}else{
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "EMOJI_NO_TERM")
			});
		}
	}
};