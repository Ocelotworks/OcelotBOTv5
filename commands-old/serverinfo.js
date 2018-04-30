/**
 * Created by Peter on 02/07/2017.
 */
const SourceQuery = require('sourcequery');
const config = require('config').get("Commands.serverinfo");
const sq = new SourceQuery(1000);
module.exports = {
    name: "Source Server Info",
    usage: "serverinfo <ip> [port]",
    accessLevel: 0,
    commands: ["serverinfo"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(channel == "318432654880014347")return;
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.embedLinks)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "ERROR_NEEDS_PERMISSION", "Embed Links")
			});
			return;
		}
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Invalid usage: `!serverinfo <ip> [port]`"
            });
        }else{
            const preset = config.get("presets")[args[1].toLowerCase()];
            const gameColours = config.get("gameColours");
            if(preset){
                args[1] = preset[0];
                args[2] = preset[1];
            }
            recv.simulateTyping(channel);
            sq.open(args[1], args[2] ? args[2] : 27015);
            sq.getInfo(function sourceQueryInfo(err, info){
                bot.logger.log("Retrieved server info for "+args[1]);
                if(err){
					bot.raven.captureException(err);
                    recv.sendMessage({
                        to: channel,
                        message: ":warning: Error retrieving server information: "+err
                    });
                }else{
					sq.getPlayers(function sourceQueryPlayers(err, players){
						var output = ".";
						for(var i in players){
							output += players[i].name + "\n";
							if(i > 10){
								output += `...and ${players.length-i} more`;
								break;
							}
						}
						recv.sendAttachment(channel, `steam://connect/${args[1]}:${args[2]}`, [{
							fallback: `_\n*${info.name}* (${info.players}+${info.bots}/${info.maxplayers}) steam://connect/${args[1]}:${args[2]}\n` +
							`\`map\`: ${info.map}\n` +
							`\`game\`: ${info.game}\n` +
							`\`version\`:${info.version}\n` +
							`\`folder\`: ${info.folder}`,
							color: gameColours[info.folder] ? gameColours[info.folder] : "#45a569",
							title: info.name,
							description: "I don't know why this is here",
							fields: [
								{
									title: "Players",
									value: `${info.bots}+${info.players}/${info.maxplayers}`,
									short: true
								},
								{
									title: "Map",
									value: info.map,
									short: true
								},
								{
									title: "Gamemode",
									value: info.game,
									short: true
								},
								{
									title: "Version",
									value: info.version,
									short: true
								},
								{
									title: "Players",
									value: output,
									short: false
								}
							],
							"callback_id": "serverinfo",
							actions: [
								{
									text: "View Players",
									name: "viewplayers",
									value: `${args[1]}:${args[2]}`,
									type: "button"
								}
							]
						}]);

						sq.close();
					});
				}
            });
        }
    }
};