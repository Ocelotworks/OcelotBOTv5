/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const orientations = [
    "straight",
    "gay",
    "tranny"
];
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest [country]",
    accessLevel: 0,
    commands: ["pornsuggest"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args[1] && args[1].length > 3){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "PORNSUGGEST_INVALID_COUNTRY")
            });
        }else{
            request(`https://www.pornmd.com/getliveterms?country=${args[1] ? args[1] : ""}&orientation=${bot.util.arrayRand(orientations)}`,async function(err, resp, body){
                if(err){
					bot.raven.captureException(err);
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "PORNSUGGEST_ERROR")
                    });
                    bot.logger.error(err.stack);
                }else{
                    try{
                        const names = JSON.parse(body);
                        if(names.length === 0){
                            recv.sendMessage({
                                to: channel,
                                message: await bot.lang.getTranslation(server, "PORNSUGGEST_NO_TERMS")
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: await bot.lang.getTranslation(server, "PORNSUGGEST_RESPONSE", {phrase: bot.util.arrayRand(names).keyword})
                            });
                        }
                    }catch(e){
						bot.raven.captureException(e);
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "PORNSUGGEST_INVALID_RESPONSE")
                        });
                        bot.logger.error(e.stack);
                    }
                }
            });
        }
    }
};