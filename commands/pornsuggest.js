/**
 * Ported by Neil - 30/04/18
 */

const request = require('request');
const orientations = [
    "straight",
    "gay",
    "tranny"
];
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest [country] [gay/straight/tranny]",
    commands: ["pornsuggest"],
    run: function run(message, args, bot) {
	   if(args[1] && args[1].length > 3){
		   message.replyLang("PORNSUGGEST_INVALID_COUNTRY");
        }else{
            request(`https://www.pornmd.com/getliveterms?country=${args[1] ? args[1] : ""}&orientation=${args[2] || bot.util.arrayRand(orientations)}`, function(err, resp, body){
                if(err){
					bot.raven.captureException(err);
                    message.replyLang("PORNSUGGEST_ERROR");
                    bot.logger.error(err.stack);
                }else{
                    try{
                        const names = JSON.parse(body);
                        if(names.length === 0){
                            message.replyLang("PORNSUGGEST_NO_TERMS");
                        }else{
							message.replyLang("PORNSUGGEST_RESPONSE", {phrase: bot.util.arrayRand(names).keyword});
                        }
                    }catch(e){
						bot.raven.captureException(e);
						message.replyLang("PORNSUGGEST_INVALID_RESPONSE");
                        bot.logger.error(e.stack);
                    }
                }
            });
        }
    }
};