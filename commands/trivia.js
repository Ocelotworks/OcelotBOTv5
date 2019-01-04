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

const runningGames = [];

module.exports = {
    name: "Trivia",
    usage: "trivia leaderboard monthly",
    rateLimit: 2,
    commands: ["trivia"],
    categories: ["tools", "fun", "games"],
    requiredPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
    run: async function run(message, args, bot) {
       if(args[1]){
            if(args[1].toLowerCase().startsWith("leaderboard")){
                message.channel.startTyping();

                let leaderboardData;
                if(args[2] && args[2].toLowerCase() === "monthly"){
                    leaderboardData = await bot.database.getMonthlyTriviaLeaderboard();
                }else if(args[2] && args[2].toLowerCase() === "server" && message.guild) {
                    leaderboardData = await bot.database.getServerTriviaLeaderboard(message.guild.members.keyArray());
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
                if(args[2] && args[2].toLowerCase() === "daily"){
                    message.channel.send("There's no daily leaderboard queen, fuck");
                }else {
                    message.replyLang("TRIVIA_LEADERBOARD_LIST" + (args[2] ? "_MONTHLY" : ""), {
                        user: message.author.id,
                        position: position,
                        total: leaderboardData.length,
                        list: columnify(data)
                    });
                }

                message.channel.stopTyping();

            }else{
                message.replyLang("TRIVIA_INVALID_USAGE");
            }
       }else{
           if(!message.guild){
               message.channel.send(":warning: This command can't be used in a DM channel.");
               return;
           }
           if(message.getSetting("trivia.singleOnly") && runningGames.indexOf(message.channel.id) > -1){
               message.channel.send(":warning: Only one trivia game can run at a time");
               return;
           }
           message.channel.startTyping();
           runningGames.push(message.channel.id);
           request(message.guild.getSetting("trivia.url"), async function triviaResponse(err, resp, body){
               if(err){
                   bot.raven.captureException(err);
                   message.replyLang("TRIVIA_ERROR");
                   if(runningGames.indexOf(message.channel.id) > -1)
                       runningGames.splice(runningGames.indexOf(message.channel.id), 1);
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

                        embed.setTitle(await bot.lang.getTranslation(message.guild.id, "TRIVIA_SECONDS", {seconds: message.getSetting("trivia.seconds")}));
                        embed.setDescription(decodeURIComponent(question.question));
                        embed.setAuthor(await bot.lang.getTranslation(message.guild.id, "TRIVIA_CATEGORY", decodeURIComponent(question.category)));
                        embed.setColor(difficultyColours[question.difficulty]);

                        if(isBoolean){
                            embed.addField(
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: "TRUE"}),
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: ":white_check_mark:"}), true);
                            embed.addField(
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: "FALSE"}),
                                await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: ":negative_squared_cross_mark:"}), true)
                        }else{
                            for(let i = 0; i < answers.length; i++){
                                embed.addField(
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: decodeURIComponent(answers[i])}),
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: numbers[i]}), true)
                            }
                        }

                        const sentMessage = await message.channel.send("", embed);
                        const reactions = isBoolean ? ["❎", "✅"] : ["1⃣", "2⃣", "3⃣", "4⃣"];
                        const correctReaction = reactions[answers.indexOf(correctAnswer)];

                        sentMessage.awaitReactions((reaction, user) => reactions.indexOf(reaction.emoji.name) > -1 && user.id === bot.client.user.id, {time: message.getSetting("trivia.seconds")*1000})
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
                                if(runningGames.indexOf(message.channel.id) > -1)
                                    runningGames.splice(runningGames.indexOf(message.channel.id), 1);

                                const points = difficulties.indexOf(question.difficulty) + 2;
                                let output = await bot.lang.getTranslation(message.guild.id, "TRIVIA_TIME_END", {answer: decodeURIComponent(correctAnswer)})+"\n";

                                if(correct.length === 0){
                                    output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN_NONE")+"\n";
                                }else{
                                    for(let i = 0; i < correct.length; i++){
                                        output +=  `<@${correct[i]}> `;
                                        bot.database.logTrivia(correct[i], 1, points, message.guild.id).then(async function(){
                                            let count = (await bot.database.getTriviaCorrectCount(correct[i]))[0]['COUNT(*)'];
                                            if(count >= 10 && count < 50 && !(await bot.database.hasBadge(correct[i], 13))){
                                                await bot.database.giveBadge(correct[i], 13);
                                            }else if(count > 50 && count < 100 && !(await bot.database.hasBadge(correct[i], 14))){
                                                await bot.database.giveBadge(correct[i], 14);
                                            }else if(count > 100 && !(await bot.database.hasBadge(correct[i], 15))){
                                                await bot.database.giveBadge(correct[i], 15);
                                            }
                                        });
                                    }
                                    output += "\n";

                                    output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN"+ (correct.length === 1 ? "_SINGLE" : ""), {points});
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
                        if(runningGames.indexOf(message.channel.id) > -1)
                            runningGames.splice(runningGames.indexOf(message.channel.id), 1);
                    }
               }catch(e){
                   message.replyLang("TRIVIA_ERROR");
                   bot.logger.error("Trivia service gave unexpected response:");
                   console.log(e);
                   console.log(body);
                   bot.logger.error(e);
               }finally{
                   if(runningGames.indexOf(message.channel.id) > -1)
                    runningGames.splice(runningGames.indexOf(message.channel.id), 1);
                   message.channel.stopTyping();
               }
           });
       }
    }
};