/**
 * Created by Peter on 12/07/2017.
 */

const request = require('request');
const async = require('async');
const columnify = require('columnify');
const triviaSeconds = 15;

const difficulties = [
    "easy",
    "medium",
    "hard"
];

const difficultyColours = {
    easy: "#51ff81",
    medium: "#ff7d2d",
    hard: "#ff150e"
};

const numbers = [
    "one",
    "two",
    "three",
    "four"
];

module.exports = {
    name: "Trivia",
    usage: "trivia leaderboard",
    accessLevel: 10,
    commands: ["trivia"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args[1] && (args[1].toLowerCase() === "stats" || args[1].toLowerCase() === "leaderboard")) {
        	const isMonthly = (args[2] && args[2].indexOf("month") > -1);
            const result = isMonthly ? await bot.database.getMonthlyTriviaLeaderboard() : await bot.database.getTriviaLeaderboard();
			var data = [];
			var i = 0;
			var position = -1;
			async.eachSeries(result, function (entry, cb) {
				i++;
				if(entry.user == userID){
					position = i;
					if(i > 10){
						cb(true);
						return;
					}
				}else if (i > 100){
					position = "over 100";
					cb(true);
					return;
				}
				if(i <= 10)
					recv.getUser(entry.user, function (err, user) {
						data.push({
							"#": i,
							"User": user ? `${user.username}#${user.discriminator}` : `Unknown User ${entry.user}`,
							"Score": entry.Score,
							"Correct": entry.correct,
						});
						cb();
					});
				else cb();
			}, function () {
				recv.sendMessage({
					to: channel,
					message: `<@${userID}>, you are **#${position}** out of **${result.length}** trivia players${isMonthly ? " this month!" : "! **To see monthly scores, type !trivia leaderboard monthly**."}\nTOP 10 Trivia Players:\n\`\`\`yaml\n${columnify(data)}\n\`\`\``
				});
			});
			if (debug)
				recv.sendMessage({
					to: channel,
					message: `\`\`\`json\n${JSON.stringify(result)}\n\`\`\``
				});
            return;
        }
        bot.ipc.emit("instanceBusy", {instance: bot.instance});
        if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.addReactions | bot.util.PERMISSIONS.embedLinks)){
        	console.log("No permissions");
        	recv.sendMessage({
				to: channel,
				message: ":warning: This command requires the permissions **Add Reactions** and **Embed Links**"
			});
        	return;
		}
		recv.simulateTyping(channel);
        request("https://opentdb.com/api.php?amount=1&encode=url3986", function(err, resp, body){
            if(err){
                recv.sendMessage({
                    to: channel,
                    message: "Trivia service is currently unavailable ("+err+")"
                })
            }else{
                // questionsInProgress.push(channel);
                try{
                    var data = JSON.parse(body);
                    if(data.results[0]){
                        var question = data.results[0];
                        var answers = question.incorrect_answers;
                        answers.push(question.correct_answer);
                        bot.util.shuffle(answers);
                        var correctAnswer = question.correct_answer;
                        var isBoolean = question.type === "boolean";
                        var fields = [];

                        if(isBoolean){
                            fields = [
                                {
                                    title: "For TRUE:",
                                    value: "React with :white_check_mark:",
                                    short: true
                                },
                                {
                                    title: "For FALSE:",
                                    value: "React with :negative_squared_cross_mark:",
                                    short: true
                                }
                            ];
                        }else{
                            for(var i in answers){
                                fields.push({
                                    title: `For "${decodeURIComponent(answers[i])}":`,
                                    value: `React with :${numbers[i]}:`,
                                    short: true
                                });
                            }
                        }

                        recv.sendAttachment(channel, `:information_source: Currently testing new trivia features. If you have any problems please use the !feedback command.\nCategory: *${decodeURIComponent(question.category)}*`, [{
                            fallback: `True/False: ${encodeURIComponent(question.question)}. React :white_check_mark: for true and :negative_squared_cross_mark: for false. You have ${triviaSeconds} seconds.`,
                            color: difficultyColours[question.difficulty],
                            title: bot.isDiscord ? `*You have ${triviaSeconds} seconds to answer.*\nTrue or False:` : `You have ${triviaSeconds} seconds to answer.\nTrue or False:`,
                            text: decodeURIComponent(question.question),
                            fields: fields

                        }], bot.util.after(500, function(err, resp){
                            if(err){
                                bot.logger.error("Error sending trivia question: "+err);
                                bot.logger.error(err);
                                recv.sendMessage({
                                    to: channel,
                                    message: ":bangbang: Something went wrong. Try Again Later."
                                });
                            }else{
                                const id = resp.id || resp.ts;
                                const reactions = isBoolean ? ["✅", "❎"] : ["1⃣", "2⃣", "3⃣", "4⃣"];
                                bot.queueReactions(reactions, channel, id, recv);
                                console.log("Correct answer is "+correctAnswer);
                                setTimeout(function(){
                                    var entries = {};
                                    recv.simulateTyping(channel);
                                    async.eachSeries(reactions, function(reaction, cb){
                                        recv.getReaction({
                                            channelID: channel,
                                            messageID: id,
                                            reaction: reaction
                                        }, function(err, resp){
                                            if(resp)
                                            	entries[reaction] = resp.map(function(a){return a.id;});
                                            setTimeout(cb, 300);
                                        });
                                    }, function(){
                                        const correctReaction = reactions[isBoolean ? correctAnswer === "True" ? 0 : 1 : answers.indexOf(correctAnswer)];
                                        const correctUsers = entries[correctReaction];
                                        var winners = [];
                                        async.eachSeries(correctUsers, function(candidate, cb){
                                            var allowed = true;
                                            for(var i in entries){
                                                if(entries.hasOwnProperty(i)) {
                                                    if (i !== correctReaction && entries[i].indexOf(candidate) > -1) {
                                                        console.log(`Removing ${candidate} for voting on the correct answer and ${i} (${entries[i]}, ${entries[i].indexOf(candidate)})`);
                                                        allowed = false;
                                                        break;
                                                    }
                                                }
                                            }
                                            if(allowed)
                                                winners.push(candidate);
                                            cb();
                                        }, async function(){
											console.log(winners);
											var points = difficulties.indexOf(question.difficulty) + 1;
											if(!isBoolean) points *= 2;
											var message = `:watch: Time's up! The correct answer was **${decodeURIComponent(correctAnswer)}**.`;
											if(winners.length > 0){
												message += " Congratulations:\n";
												for(var i in winners){
													message += "<@" + winners[i] + "> "
												}
												message += `\n You ${winners.length > 1 ? "each " : ""}win **${points}** points! Check out **!trivia leaderboard** to see where you stand.`
											}else{
												message += "\nNobody won that round ):"
											}
											recv.sendMessage({
												to: channel,
												message: message
											});

											for(var i in winners){
												if(winners.hasOwnProperty(i)){
													try{
														await bot.database.logTrivia(winners[i], 1, points, server);
														bot.logger.log(`Logged trivia win for ${winners[i]}`);
													}catch(err){
														bot.logger.error(err.stack);
													}
												}
											}
											bot.ipc.emit("instanceFree", {instance: bot.instance});
										});
                                    });
                                }, triviaSeconds*1000);
                            }
                        }));

                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: Trivia service is currently unavailable (`"+body+"`)"
                        });
                    }
                }catch(e){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Error parsing trivia question: "+e
                    });
                }
            }

        });


    }
};