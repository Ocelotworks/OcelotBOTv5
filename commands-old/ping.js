/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
module.exports = {
    name: "Ping Address",
    usage: "ping <address> [timeout] [times]",
    accessLevel: 0,
    commands: ["ping"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "PING_NO_ADDRESS")
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "PING_PINGING", args[1])
            }, async function(err, resp){
                var id = resp.ts || resp.id;

               const res = await ping.promise.probe(args[1].replace(/[<>|]/g, ""), {
                        timeout: args[2] ? args[2] : 1000,
                        extra: args[3] ? [" -c "+args[3]] : ""
                    });
				if(res.alive){
					recv.editMessage({
						channelID: channel,
						messageID: id,
						message: await bot.lang.getTranslation(server, "PING_RESPONSE", res.output)
					});
				}else{
					recv.editMessage({
						channelID: channel,
						messageID: id,
						message: await bot.lang.getTranslation(server, "PING_NO_RESPONSE")
					});
				}
            });
        }
    }
};