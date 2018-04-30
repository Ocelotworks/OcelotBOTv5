/**
 * Created by Peter on 12/10/2017.
 */
module.exports = {
	name: "User Stats",
	usage: "userstats <user>",
	accessLevel: 0,
	commands: ["userstats"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!args[1]){
			recv.sendMessage({
				to: channel,
				message: `Incorrect usage. ${args[0]} @user`
			});
		}else{
			const target = args[1].replace(/[<>@!]/g, "");
			try{
				recv.simulateTyping();
				var result = await bot.database.getUserStats(target);
				if(!result[0]){
					recv.sendMessage({
						to: channel,
						message: "Couldn't find that user or they haven't done any commands. Did you @mention them?"
					});
				}else{
					recv.sendMessage({
						to: channel,
						message: `<@${target}> has performed **${result[0].commandCount}** commands.`
					});
				}

			}catch(e){
				bot.raven.captureException(e);
				recv.sendMessage({
					to: channel,
					message: ":bangbang: An error occurred. Try again later."
				})
			}
		}

	}
};