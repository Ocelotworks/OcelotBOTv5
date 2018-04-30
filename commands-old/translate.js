/**
 * Created by Peter on 02/07/2017.
 */
const request = require('request');
const config = require('config');
module.exports = {
    name: "Translate text",
    usage: "translate <to> <sentence>",
    accessLevel: 0,
    commands: ["translate"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length < 3){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Invalid usage. Try: !translate en J'adore le fromage"
            });
        }else {
            var sentence = message.substring(message.indexOf(args[2]));

            request(`https://translate.yandex.net/api/v1.5/tr.json/detect?key=${config.get("Commands.translate.key")}&text=${encodeURIComponent(sentence)}`, function getTranslationLanguage(err, response, body) {
                if (err) {
					bot.raven.captureException(err);
                    bot.sendMessage({
                        to: channel,
                        message: ":warning: There was an error contacting the translation server."
                    });
                    bot.logger.error("Error getting translation language: " + err);
                } else {
                	try{
						var langResult = JSON.parse(body);
						if(langResult.code === 200){
							request(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${config.get("Commands.translate.key")}&lang=${langResult.lang}-${args[1]}&text=${encodeURIComponent(sentence)}`, function getTranslation(err, response, body){
								if(err){
									bot.raven.captureException(err);
									recv.sendMessage({
										to: channel,
										message: ":warning: There was an error contacting the translation server."
									});
									bot.logger.error(`Error translating '${sentence}': ${err}`);
								}else{
									try{
										var transResult = JSON.parse(body);
										if(transResult.code === 200){
											recv.sendMessage({
												to: channel,
												message: "Translated " + transResult.lang + ":\n>" + transResult.text
											});
										}else{

											recv.sendMessage({
												to: channel,
												message: ":warning: Error: " + langResult.message + "\nYou must supply an output language i.e 'en'"
											});
										}
									}catch(e){
										bot.raven.captureException(e);
										recv.sendMessage({
											to: channel,
											message: ":bangbang: Received a bad response from the translate server. Try again later."
										});
									}
								}
							});
						}else{
							recv.sendMessage({
								to: channel,
								message: `:warning: Error guessing language (${langResult.code}). Try again later`
							});
							bot.logger.error(body);
						}
					}catch(e){
						bot.raven.captureException(e);
						recv.sendMessage({
							to: channel,
							message: ":bangbang: Received a bad response from the translate server. Try again later."
						});
					}
                }
            });
        }
    }
};