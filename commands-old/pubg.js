/**
 * Created by Peter on 24/07/2017.
 */

const   request = require('request'),
        config = require('config');

module.exports = {
    name: "PUBG Stats",
    usage: "pubg <username> [solo/duo/squad]",
    accessLevel: 0,
    commands: ["pubg", "battlegrounds"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.embedLinks)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "ERROR_NEEDS_PERMISSION", "Embed Links")
			});
			return;
		}
        if(!args[1]){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "PUBG_NO_USERNAME", args[0])
            });
        }else{
            request({
                url: `https://pubgtracker.com/api/profile/pc/${args[1]}`,
                headers: {
                    "TRN-Api-Key": config.get("Commands.pubg.key")
                }
            }, async function(err, resp, body){
                if(err)bot.raven.captureException(err);
                try{
                    var data = JSON.parse(body);
                    if(data.error){
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "PUBG_INVALID_USER")
                        })
                    }else{
                        const section = args[2] ? args[2] : "solo";
                        const updated = new Date(data.LastUpdated);
                        var fields = [];
                        for(var i in data.Stats){
                            if(data.Stats[i].Match.toLowerCase() === section.toLowerCase()){
                                for(var j in data.Stats[i].Stats){
                                    var stat = data.Stats[i].Stats[j];
                                    fields.push({
                                        name: stat.label,
                                        value: await bot.lang.getTranslation(server, "PUBG_STAT", stat),
                                        inline: true
                                    });
                                }
                                break;
                            }
                        }
                        recv.sendMessage({
                            to: channel,

                            message: !args[2] ? await bot.lang.getTranslation(server, "PUBG_SOLO", {command: args[0], username: args[1]}) : await bot.lang.getTranslation(server, "PUBG_SECTION", section),
                            color: 0xf7f733,
                            embed: {
								title: await bot.lang.getTranslation(server, "PUBG_STATS", data.PlayerName),
								description: await bot.lang.getTranslation(server, "PUBG_LAST_UPDATED", {date: updated.toLocaleDateString(), time: updated.toLocaleTimeString()}),
                                thumbnail: {
                                    "url": data.Avatar
                                },
                                fields: fields
                            }
                        })
                    }
                }catch(e){
					bot.raven.captureException(e);
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "PUBG_INVALID_RESPONSE")
                    });
                    bot.logger.error(e.stack);
                }

            })
        }
    }
};