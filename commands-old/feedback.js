/**
 * Created by Peter on 13/06/2017.
 */
module.exports = {
    name: "Leave Feedback",
    usage: "feedback [message]",
    accessLevel: 0,
    commands: ["feedback", "support"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length > 1){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "FEEDBACK_SUCCESS")
            });
            const serverInfo = await recv.getServer(server);
			recv.sendMessage({
				to: "344931831151329302",
				message: `Feedback from ${userID} (${user}) in ${server} (${serverInfo ? serverInfo.name : "DM"}):\n${message}`
			});
        }else{
            recv.sendMessage({
                to: channel,
                message:  await bot.lang.getTranslation(server, "FEEDBACK_ERROR")
            });
        }
    }
};