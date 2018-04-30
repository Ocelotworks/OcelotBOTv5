
const conflictingBots = [
	"189702078958927872", //ErisBot
	"256530827842813962", //Fergus
	"290225453354975232", //LoLPromoter
	"107256979105267712", //KupoBot
	"81026656365453312",  //Gravebot
	"86920406476292096",  //Lopez
	"242728049131388930", //QT Bot
	"324356264983527424", //MatBot
	"265161580201771010", //MatBot
	"172002275412279296", //Tatsumaki,
	"204777316621090816", //RPBot
	"292953664492929025", //UnbelievableBot,
	"159985870458322944", //Mee6
	"170903342199865344", //NoSoBot
];
module.exports = {
	id: "fixServers",
	run: function run(user, userID, channel, message, args, event, bot, recv){
		recv.sendMessage({
			to: channel,
			message: "This will take a while, and is messy... consult the log"
		});
		const currentServers = bot.serverCache;
		bot.logger.log("Getting entire server list...");
		bot.emitWithCallback("command", {
			receiver: "discord",
			args: ["bot.receivers.discord.internal.client.servers", undefined],
			command: "eval",
		}, function(err, result){
			bot.logger.log("Got entire serverlist");
			const newServers = result;
			const newServerIDs = Object.keys(newServers);
			const oldServerIDs = Object.keys(currentServers);
			bot.logger.log(newServerIDs.length-oldServerIDs.length+" new servers");
			for(var i = 0; i < newServerIDs.length; i++){

				bot.logger.log("Found server ID "+newServerIDs[i]);
				let server = newServers[newServerIDs[i]];
				bot.database.addServer(server.id, server.owner_id, server.name, server.joined_at)
					.then(function(){
						bot.logger.log(`Joined server ${server.name} (${server.id})`);
						var conflicts = [];

						for(var i = 0; i < conflictingBots.length; i++){
							if(Object.keys(server.members).indexOf(conflictingBots[i]) > -1){
								conflicts.push(conflictingBots[i]);
							}
						}
						if(conflicts.length > 0){
							bot.logger.log(`Detected ${conflicts.length} conflicts in ${server.id}`);
							bot.receiver.sendMessage({
								to: server.id,
								message: `:warning: Heads up: **${conflicts.length}** bots in this server use the same default prefix (!) as I do.\nYou can change my prefix using \`!settings set prefix whatever\` to avoid problems.`
							});
						}
					})
					.catch(function(err){
						if(err.message.indexOf("Duplicate") === -1){
							bot.logger.error(err.message);
						}
					});

			}
		});
	}
};