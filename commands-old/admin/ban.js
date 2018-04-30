/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "ban",
    run: async function run(user, userID, channel, message, args, event, bot, recv){
        var type = args[2].toLowerCase();
        var id = args[3].replace(/[&<>@!]/g, "");
        var reason = message.substring(message.indexOf(args[3])+args[3].length);
        await bot.database.ban(id, type, reason);
		bot.banCache[type].push(id);
		recv.sendMessage({
			to: channel,
			message: `Successfully banned ${type} ${id} for: ${reason}`
		});
		if(type !== "server"){
			recv.sendMessage({
				to: id,
				message: `:bangbang: ${type === "user" ? "You" : "This "+type} has been banned from using OcelotBOT. Reason: **${reason}**\nIf you believe this is an error, add __Big P#1843__.`
			});
		}
		bot.ipc.emit("broadcast", {event: "clearBanCache"});
    }
};