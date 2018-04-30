/**
 * Created by Peter on 01/07/2017.
 */
const fs = require('fs');
const parseDuration = require("parse-duration");
const chrono = require('chrono-node');
const regex = new RegExp("!.*?( .* )[\“\”\"\‘\’\'\‘\‚«»«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‘\‚«»«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Reminders",
    usage: "remind <in> \"<message>\"",
    accessLevel: 0,
    commands: ["remind", "remindme", "reminder"],
    init: async function(bot, cb){
    	try{
			if(parseInt(process.argv[2]) < 1){
				bot.logger.log("This is the reminder instance");
				const result = await bot.database.getReminders();
				const now = new Date();
				for(var i in result)
					if(result.hasOwnProperty(i)){
						let reminder = result[i];
						var time = reminder.at - now;
						console.log(now);
						console.log(reminder.at);
						console.log("-----");
						console.log(time);
						if(time <= 0){
							bot.logger.log(`Reminder ${reminder.id} has expired. (${time}ms difference)`);
							bot.receiver.sendMessage({
								to: reminder.channel,
								message: await bot.lang.getTranslation(reminder.server, "REMIND_REMINDER", {
									username: reminder.user,
									date: reminder.timestamp,
									message: reminder.message
								})
							});
							try{
								await bot.database.removeReminder(reminder.id);
								bot.logger.log(`Removed reminder ${reminder.id}`);
							}catch(err){
								bot.raven.captureException(err);
								bot.logger.error(`Error removing reminder: ${err.stack}`);
							}
						}else{
							bot.logger.log(`Loaded reminder for ${time} ms - ${JSON.stringify(reminder)}`);
							bot.util.setLongTimeout(async function(){
								bot.logger.log(`Reminding ${JSON.stringify(reminder)}`);
								bot.receiver.sendMessage({
									to: reminder.channel,
									message: await bot.lang.getTranslation(reminder.server, "REMIND_REMINDER", {
										username: reminder.user,
										date: reminder.timestamp,
										message: reminder.message
									})
								});
								try{
									await bot.database.removeReminder(reminder.id);
									bot.logger.log(`Removed reminder ${reminder.id}`);
								}catch(err){
									bot.logger.error(`Error removing reminder: ${err.stack}`);
								}
							}, time);
						}
					}
			}else{
				bot.logger.log("skipping reminders (This is ocelotbot-"+parseInt(process.argv[2])+")")
			}
		}catch(err){
			bot.raven.captureException(err);
    		bot.logger.error("Error during reminder loading:");
    		bot.logger.error(err.stack);
		}finally{
			cb();
		}
    },
    run: async function run(user ,userID, channel, message, args, event, bot, recv, debug, server) {
        var rargs = regex.exec(message);
        if(!rargs || rargs.length < 3){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "REMIND_INVALID_MESSAGE")
            })
        }else{
        	const now = new Date();
        	const at = chrono.parseDate(message, now);
            const offset = at - now.getTime();
            if(offset === 0){
                recv.sendMessage({
                    to: channel,
                    message: await bot.lang.getTranslation(server, "REMIND_INVALID_TIME")
                });
            }else{
                if(offset < 1000){
                    recv.sendMessage({
                        to: channel,
                        message: await bot.lang.getTranslation(server, "REMIND_SHORT_TIME")
                    });
                }else {
                    recv.sendMessage({
                        to: channel,
						message: await bot.lang.getTranslation(server, "REMIND_SUCCESS", {time: bot.util.prettySeconds(offset / 1000), date: at})
                    });
                    if (debug)
                        recv.sendMessage({
                            to: channel,
                            message: `Offset ${offset}`
                        });
                    recv.getServerFromChannel(channel, function (err, server) {
                        bot.database.addReminder(recv.id, userID, server, channel, at.getTime(), rargs[2])
                            .then(function (resp) {
                                bot.util.setLongTimeout(async function () {
                                    recv.sendMessage({
                                        to: channel,
										message: await bot.lang.getTranslation(server, "REMIND_REMINDER", {
											username: userID,
											date: at.getTime(),
											message: rargs[2]
										})
                                    });
                                    bot.database.removeReminder(resp[0])
                                        .then(function () {
                                            bot.logger.log(`Removed Reminder ${resp[0]}`)
                                        })
                                        .catch(function (err) {
                                            bot.logger.error(err.stack);
                                            bot.raven.captureException(err);
                                        });
                                }, offset);
                            })
                            .catch(async function (err) {
                                recv.sendMessage({
                                    to: channel,
                                    message: await bot.lang.getTranslation(server, "REMIND_ERROR")
                                });
                                bot.logger.error(err.stack);
                                bot.raven.captureException(err);
                            });
                    });
                }

            }
        }

    }
};
