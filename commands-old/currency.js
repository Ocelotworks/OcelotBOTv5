/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
module.exports = {
    name: "Currency Converter",
    usage: "currency <currency> <currency>",
    accessLevel: 0,
    commands: ["currency"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length < 3){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server,"CONVERT_INVALID_CURRENCY")
            });
        }else{
            const first = args[1].toUpperCase();
            const second = args[2].toUpperCase();
            recv.simulateTyping(channel);
            request(`https://api.fixer.io/latest?symbols=${second}&base=${first}`,async function currencyConverterCB(err, resp, body){
                if(err){
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "CONVERT_INVALID_RESPONSE")
                    });
					bot.raven.captureException(err);
                    bot.logger.error(err);
                }else{
                    try{
                        const data = JSON.parse(body);
                        if(data.base && data.rates[second]){
                            recv.sendMessage({
                                to: channel,
                                message: `:dollar: 1 ${data.base} = ${data.rates[second]} ${second}`
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: await bot.lang.getTranslation(server,"CONVERT_INVALID_CURRENCY")
                            });
                        }
                    }catch(e){
						bot.raven.captureException(e);
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server,"CONVERT_INVALID_RESPONSE")
                        });
                        bot.logger.error(e);
                        bot.logger.error(body);
                    }
                }
            })
        }

    }
};