/**
 * Created by Peter on 01/07/2017.
 */

const request = require('request');
module.exports = {
    name: "Urban Dictionary",
    usage: "defineud <word>",
    accessLevel: 0,
    commands: ["defineud", "ud"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        const term = encodeURIComponent(args.slice(1).join(" "));
        request(`http://api.urbandictionary.com/v0/define?term=${term}`, async function(err, resp, body){
            if(err){
				bot.raven.captureException(err);
                bot.logger.error(err.stack);
                recv.sendMessage({
                    to: channel,
                    message: await bot.lang.getTranslation(server, "UD_ERROR")
                });
            }else{
                try{
                    const data = JSON.parse(body);
                    if(data && data.list.length > 0){
                        const randEntry = bot.util.arrayRand(data.list);
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "UD_DEFINITION", {word: randEntry.word, definition: randEntry.definition, example: randEntry.example})
                        });
                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "UD_NO_DEFINITIONS")
                        });
                    }
                }catch(e){
					bot.raven.captureException(e);
                    bot.logger.error(e.stack);
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "UD_INVALID_RESPONSE")
                    });
                }
            }
        });

    }
};