module.exports = {
	id: "disableCommand",
	run: function run(user, userID, channel, message, args, event, bot, recv){
		if(bot.commands[args[2]]){
			delete bot.commands[args[2]];
			recv.sendMessage({
				to: channel,
				message: `Deleted \`${args[2]}\` on this instance (\`ocelotbot-${bot.instance}\`). Note the command can only be re-added with a restart of this instance.`
			});
		}else{
			recv.sendMessage({
				to: channel,
				message: "That command does not exist or is already deleted."
			});
		}
	}
};
