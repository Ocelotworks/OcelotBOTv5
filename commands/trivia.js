const columnify = require('columnify');
const pasync = require('promise-async');
const request = require('request');
const Discord = require('discord.js');

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
    ":one:",
    ":two:",
    ":three:",
    ":four:"
];

module.exports = {
    name: "Trivia",
    usage: "trivia leaderboard monthly",
    commands: ["trivia"],
    categories: ["tools", "fun", "games"],
    requiredPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
    run: async function run(message, args, bot) {
       if(args[1]){
            if(args[1].toLowerCase().startsWith("leaderboard")){
                message.channel.startTyping();

                let leaderboardData;
                if(args[2]){
                    leaderboardData = await bot.database.getMonthlyTriviaLeaderboard();
                }else{
                    leaderboardData = await bot.database.getTriviaLeaderboard();
                }

                const userKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_USER");
                const scoreKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_SCORE");
                const correctKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_CORRECT");
                const unknownUserKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_UNKNOWN_USER");

                let i = 0;
                let data = [];
                let position = -1;

                await pasync.eachSeries(leaderboardData, async function processLeaderboard(entry, cb){
                    i++;
                    if(entry.user === message.author.id){
                        position = "#"+i;
                        if(i > 10){
                            cb();
                            return;
                        }
                    }
                    if(i <= 10)
                        try {
                            const user = bot.client.users.get(entry.user);
                            data.push({
                                "#": i,
                                [userKey]: user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                                [scoreKey]: entry.Score,
                                [correctKey]: entry.correct,
                            });
                        }catch(e){
                            bot.logger.error("Error processing leaderboard entry");
                            bot.logger.error(e);
                        }finally{
                            cb();
                        }
                    else cb();
                });
                message.replyLang("TRIVIA_LEADERBOARD_LIST"+(args[2] ? "_MONTHLY": ""), {
                    user: message.author.id,
                    position: position,
                    total: leaderboardData.length,
                    list: columnify(data)
                });

                message.channel.stopTyping();

            }else{
                message.replyLang("TRIVIA_INVALID_USAGE");
            }
       }else{
           message.channel.startTyping();
           request("https://opentdb.com/api.php?amount=1&encode=url3986", async function triviaResponse(err, resp, body){
               if(err){
                   bot.raven.captureException(err);
                   message.replyLang("TRIVIA_ERROR");
                   message.channel.stopTyping();
                   return;
               }
               bot.raven.captureBreadcrumb({
                   body: body
               });
               try{
                   const data = JSON.parse(body);
                   const question = data.results[0];
                    if(question){
                        const correctAnswer = question.correct_answer;
                        let answers = question.incorrect_answers;
                        answers.push(correctAnswer);
                        bot.util.shuffle(answers);
                        const isBoolean = question.type === "boolean";



                        let embed = new Discord.RichEmbed();

                        embed.setTitle(await bot.lang.getTranslation(message.guild.id, "TRIVIA_SECONDS", 15));
                        embed.setDescription(decodeURIComponent(question.question));
                        embed.setAuthor(await bot.lang.getTranslation(message.guild.id, "TRIVIA_CATEGORY", decodeURIComponent(question.category)));
                        embed.setColor(difficultyColours[question.difficulty]);

                        if(isBoolean){
                            embed.addField(
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", "TRUE"),
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", ":white_check_mark:"), true);
                            embed.addField(
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", "FALSE"),
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", ":negative_squared_cross_mark:"), true)
                        }else{
                            for(let i = 0; i < answers.length; i++){
                                embed.addField(
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", decodeURIComponent(answers[i])),
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", numbers[i]), true)
                            }
                        }

                        const sentMessage = await message.channel.send("", embed);
                        const reactions = isBoolean ? ["✅", "❎"] : ["1⃣", "2⃣", "3⃣", "4⃣"];
                        const correctReaction = reactions[answers.indexOf(correctAnswer)];

                        sentMessage.awaitReactions((reaction, user) => reactions.indexOf(reaction.emoji.name) > -1 && user.id === bot.client.user.id, {time: 15000})
                            .then(async function(reactionResult){
                                message.channel.startTyping();
                                const permissions = await message.channel.permissionsFor(bot.client.user);
                                if(permissions.has("MANAGE_MESSAGES"))
                                    sentMessage.clearReactions();

                                let answered = [];
                                let cheaters = [];
                                let correct = [];

                                const reactionArray = reactionResult.array();

                                reactionArray.forEach(async function(reaction){
                                    const userArray = reaction.users.array();
                                    userArray.forEach(function(user){
                                        if(user.id === bot.client.user.id)
                                            return;
                                        if (cheaters.indexOf(user.id) > -1)
                                            return;

                                        if (answered.indexOf(user.id) > -1) {
                                            cheaters.push(user.id);
                                            return;
                                        }
                                        answered.push(user.id);

                                        if(reaction._emoji.name === correctReaction){
                                            correct.push(user.id);
                                        }
                                    });
                                });

                                message.channel.stopTyping();

                                const points = difficulties.indexOf(question.difficulty) + 2;
                                let output = await bot.lang.getTranslation(message.guild.id, "TRIVIA_TIME_END", decodeURIComponent(correctAnswer))+"\n";

                                if(correct.length === 0){
                                    output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN_NONE")+"\n";
                                }else{
                                    for(let i = 0; i < correct.length; i++){
                                        output +=  `<@${correct[i]}> `;
                                        bot.database.logTrivia(correct[i], 1, points, message.guild.id).then(function(){});
                                    }
                                    output += "\n";

                                    output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN"+ (correct.length === 1 ? "_SINGLE" : ""), points);
                                }

                                message.channel.send(output);
                            });

                       for(let i = 0; i < reactions.length; i++){
                           await sentMessage.react(reactions[i]);
                       }

                    }else{
                        message.replyLang("TRIVIA_ERROR");
                        bot.logger.error("Trivia service gave back no questions!");
                        message.channel.stopTyping();
                    }
               }catch(e){
                   message.replyLang("TRIVIA_ERROR");
                   bot.logger.error("Trivia service gave unexpected response:");
                   bot.logger.error(e);
               }finally{
                   message.channel.stopTyping();
               }
           });
       }
    }
};